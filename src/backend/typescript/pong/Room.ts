import { ServerSceneData } from "./ServerSceneData";
import { ServerPongGame } from "./ServerPongGame";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type GameInit, type GameStartInfos, type KeysUpdate, type Profile } from "@shared/ZodMessageType"
import { ClientProxy } from "./ClientProxy";
import { type int, Observable } from "@babylonjs/core";
import type { ServerType } from "../index";
import type { EndData } from "@shared/attachedScripts/GameManager";
import { SocketEventController, type DefaultSocket } from "../controllers/SocketEventController";
import { getEndDataOnInvalidMatch } from "@shared/utils";
import type { ServerMessage, ServerToClientEvents } from "@shared/ServerMessageHelpers";
import { UniqueDelayOwner } from "@shared/UniqueDelayOwner";

export type SocketMessage = {
	socketIndex : int,
	data : KeysUpdate
}

export class	Room extends UniqueDelayOwner
{
	private static readonly _showParticipantsTimeoutMs = 2000;
	private static readonly _readyTimeout = 60000;

	private _state : "waiting" | "playing" | "disposed" = "waiting";
	private _sockets : DefaultSocket[] = [];
	private _serverPongGame : ServerPongGame;
	private _roomId : string;
	private _observers : Map<string, Observable<SocketMessage>>;
	private _socketsReadyCount : int = 0;
	private _sceneData : ServerSceneData;
	
	constructor(
		private readonly _io : ServerType,
		private readonly _onDispose : (endData : EndData) => void,
		firstSocket : DefaultSocket,
		secondSocket : DefaultSocket
	) {
		super();
		this._observers = new Map<string, Observable<SocketMessage>>();
		this._roomId = crypto.randomUUID();
		this._sockets.push(firstSocket, secondSocket);

		const	clientProxy = new ClientProxy(this);

		this._sceneData = new ServerSceneData(new HavokPlugin(false), clientProxy);
		this._serverPongGame = new ServerPongGame(this._sceneData);
		const	participants = this._sockets.map((socket) => socket.data.getProfile());

		this.delay(() => {
			this.onReadyTimeout();
		}, Room._readyTimeout);

		for (let index = 0; index < this._sockets.length; index++) {
			const socket = this._sockets[index];

			this.addSocketToRoom(socket, index, participants);
		}
	}

	private	onReadyTimeout()
	{
		const	isFirstReady = this._sockets[0].data.ready;
		const	isSecondReady = this._sockets[1].data.ready;
		const	endData = getEndDataOnInvalidMatch(isFirstReady, isSecondReady);

		this.dispose(endData);
	}

	private dispose(endData : EndData)
	{
		if (this._state === "disposed")
			return ;
		this.clearDelay();
		console.log("disposing room !");
		this._io.to(this._roomId).emit("game-infos", { type:"room-closed" });
		this._state = "disposed";
		this._sockets.forEach((socket : DefaultSocket) => { this.removeSocketFromRoom(socket) });
		this._serverPongGame.dispose();
		this._onDispose(endData);
	}

	public onSocketQuit(socket : DefaultSocket)
	{
		if (this._state === "disposed")
			return ;
		const	isQuitterLeft = socket === this._sockets[0];
		const	otherSocket = isQuitterLeft ? this._sockets[1] : this._sockets[0];
		const	endMatch = () => {
			otherSocket.emit("game-infos", {type: "forfeit"});
			const	endData = getEndDataOnInvalidMatch(!isQuitterLeft, isQuitterLeft);

			this.dispose(endData);
		}

		if (otherSocket.data.ready)
			endMatch();
		else
			SocketEventController.once(otherSocket, "ready", endMatch);

	}

	private removeSocketFromRoom(socket : DefaultSocket)
	{
		socket.data.leaveRoom();
		socket.leave(this._roomId);
		socket.removeAllListeners("ready");
		socket.removeAllListeners("input-infos");
		socket.removeAllListeners("forfeit");
	}

	private addSocketToRoom(socket : DefaultSocket, playerIndex : number, participants : Profile[])
	{
		socket.data.joinRoom(this);
		socket.join(this._roomId);
		const	gameInit : GameInit = {
            playerIndex: playerIndex,
            participants: participants
        }
		socket.data.ready = false;
		if (socket.data.getState() === "tournament-playing")
			socket.emit("tournament-event", {type: "joined-game", gameInit});
		else
			socket.emit("joined-game", gameInit);
		SocketEventController.once(socket, "ready", () => { this.setSocketReady(socket) } );
		SocketEventController.once(socket, "forfeit", () => {
			if (this._state === "waiting")
				this.onSocketQuit(socket);
			else if (this._state === "playing")
			{
				socket.broadcast.to(this._roomId).emit("game-infos", { type: "forfeit" });
				const	winningSide = (playerIndex === 0) ? "right" : "left";

				this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
			}
		});
	}

	private	setSocketReady(socket : DefaultSocket)
	{
		socket.data.ready = true;
		this._socketsReadyCount++;
		if (this._socketsReadyCount === 2)
			this.startGame();
	}

	private	async startGame()
	{
		try {
			this.clearDelay();
			const	gameStartInfos = await this._sceneData.readyPromise.promise as GameStartInfos;
			this._state = "playing";
			this._sceneData.events.getObservable("end").add(endData => { this.dispose(endData) });

			this.delay(() => {
				this._sceneData.events.getObservable("game-start").notifyObservers();
				this.sendMessageToRoom("ready", gameStartInfos);
			}, Room._showParticipantsTimeoutMs);
		} catch (error) {
		}
	}

	public sendMessageToRoom<T extends keyof ServerToClientEvents>
	(
		event: T,
		...args: Parameters<ServerToClientEvents[T]>
	) {
		this._io.to(this._roomId).emit(event, ...args);
	}

	public sendMessageToSocketByIndex<T extends ServerMessage>
	(
		socketIndex : int,
		event: T,
		...args: Parameters<ServerToClientEvents[T]>
	) {
		if (socketIndex < 0 || socketIndex >= this._sockets.length)
			return ;

		const	socket = this._sockets[socketIndex];

		socket.emit(event, ...args);
	}
	
	public broadcastMessageFromSocket<T extends ServerMessage>
	(
		socketIndex : int,
		event: T,
		...args: Parameters<ServerToClientEvents[T]>
	) {
		if (socketIndex < 0 || socketIndex >= this._sockets.length)
			return ;

		const	socket = this._sockets[socketIndex];
		
		socket.broadcast.to(this._roomId).emit(event, ...args);
	}

	public onSocketMessage(event : "input-infos") : Observable<SocketMessage>
	{
		const	observer = this._observers.get(event);

		if (observer !== undefined)
			return observer;
		const	newObserver = this.createNewObservable(event);
		this._observers.set(event, newObserver);

		return newObserver;
	}

	private	createNewObservable(event : "input-infos") : Observable<SocketMessage>
	{
		const	observable = new Observable<SocketMessage>();

		this._sockets.forEach((socket : DefaultSocket, index : number) => {
			SocketEventController.on(socket, event, (keysUpdate : KeysUpdate) => {
				const	clientMessage : SocketMessage = {
					socketIndex : index,
					data : keysUpdate
				};
				observable.notifyObservers(clientMessage);
			});
		});
		return observable;
	}
}
