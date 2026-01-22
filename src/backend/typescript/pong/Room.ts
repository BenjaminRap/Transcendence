import { ServerSceneData } from "./ServerSceneData";
import { ServerPongGame } from "./ServerPongGame";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type GameInit, type GameStartInfos, type KeysUpdate, type Profile, zodKeysUpdate } from "@shared/ServerMessage"
import { ClientProxy } from "./ClientProxy";
import { type int, Observable, Vector3 } from "@babylonjs/core";
import type { ServerEvents, ServerToClientEvents } from "@shared/MessageType";
import type { ServerType } from "../index";
import type { EndData } from "@shared/attachedScripts/GameManager";
import type { DefaultSocket } from "../controllers/SocketEventController";
import { getEndDataOnInvalidMatch } from "@shared/utils";

export type SocketMessage = {
	socketIndex : int,
	data : KeysUpdate
}

export class	Room
{
	private static readonly _showParticipantsTimeoutMs = 2000;
	private static readonly _readyTimeout = 60000;

	private _sockets : DefaultSocket[] = [];
	private _serverPongGame : ServerPongGame | undefined;
	private _disposed : boolean = false;
	private _roomId : string;
	private _observers : Map<string, Observable<SocketMessage>>;
	private _socketsReadyCount : int = 0;
	private _sceneData : ServerSceneData | undefined;
	private _timeout : NodeJS.Timeout | null = null;
	
	constructor(
		private readonly _io : ServerType,
		private readonly _onDispose : (endData : EndData) => void,
		firstSocket : DefaultSocket,
		secondSocket : DefaultSocket
	) {
		this._observers = new Map<string, Observable<SocketMessage>>();
		this._roomId = crypto.randomUUID();
		this._sockets.push(firstSocket, secondSocket);

		this.init();
	}

	private	async init()
	{
		const	participants = this._sockets.map((socket) => socket.data.getProfile());

		this.delay(() => {
			this.onReadyTimeout();
		}, Room._readyTimeout);
		for (let index = 0; index < this._sockets.length; index++) {
			const socket = this._sockets[index];

			await this.addSocketToRoom(socket, index, participants);
		}

		const	clientProxy = new ClientProxy(this);
		this._sceneData = new ServerSceneData(new HavokPlugin(false), clientProxy);
		this._serverPongGame = new ServerPongGame(this._sceneData);
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
		if (this._disposed)
			return ;
		if (this._timeout)
			clearTimeout(this._timeout);
		console.log("disposing room !");
		this._io.to(this._roomId).emit("game-infos", { type:"room-closed" });
		this._disposed = true;
		this._sockets.forEach((socket : DefaultSocket) => { this.removeSocketFromRoom(socket) });
		this._serverPongGame?.dispose();
		this._serverPongGame = undefined;
		this._onDispose(endData);
	}

	public onSocketQuit(socket : DefaultSocket)
	{
		if (this._disposed)
			return ;
		socket.broadcast.to(this._roomId).emit("game-infos", { type: "forfeit" });
		const	winningSide = (socket === this._sockets[0]) ? "right" : "left";

		this._sceneData!.events.getObservable("forfeit").notifyObservers(winningSide);
	}

	private removeSocketFromRoom(socket : DefaultSocket)
	{
		socket.data.leaveRoom();
		socket.leave(this._roomId);
		socket.removeAllListeners("ready");
		socket.removeAllListeners("input-infos");
		socket.removeAllListeners("forfeit");
	}

	private async addSocketToRoom(socket : DefaultSocket, playerIndex : number, participants : Profile[])
	{
		socket.data.joinRoom(this);
		await socket.join(this._roomId);
		const	gameInit : GameInit = {
            playerIndex: playerIndex,
            participants: participants
        }
		socket.data.ready = false;
		socket.emit("joined-game", gameInit);
		socket.once("ready", () => { this.setSocketReady(socket) } );
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
		if (this._timeout)
		{
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		const	gameStartInfos = await this._sceneData!.readyPromise.promise as GameStartInfos;

		this.delay(() => {
			this._sceneData!.events.getObservable("game-start").notifyObservers();
			this._sceneData!.events.getObservable("end").add(endData => { this.gameEnd(endData) });
			this.sendMessageToRoom("ready", gameStartInfos);
			this._sockets.forEach((socket : DefaultSocket, index : int) => {
				socket.once("forfeit", () => {
					socket.broadcast.to(this._roomId).emit("game-infos", { type: "forfeit" });
					const	winningSide = (index === 0) ? "right" : "left";

					this._sceneData!.events.getObservable("forfeit").notifyObservers(winningSide);
				});
			});
		}, Room._showParticipantsTimeoutMs);
	}

	private gameEnd(endData : EndData)
	{
		console.log(endData);
		setTimeout(() => {
			this.dispose(endData);
		}, 0);
	}

	public sendMessageToRoom<T extends keyof ServerToClientEvents>
	(
		event: T,
		...args: Parameters<ServerToClientEvents[T]>
	) {
		this._io.to(this._roomId).emit(event, ...args);
	}

	public sendMessageToSocketByIndex<T extends ServerEvents>
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
	
	public broadcastMessageFromSocket<T extends ServerEvents>
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
			socket.on(event, (data : any) => {
				const	keysUpdate = zodKeysUpdate.safeParse(data);
				if (!keysUpdate.success)
					return ;
				const	clientMessage : SocketMessage = {
					socketIndex : index,
					data : keysUpdate.data
				};
				observable.notifyObservers(clientMessage);
			});
		});
		return observable;
	}

	private async delay(callback: () => void, durationMs : number)
	{
		if (this._timeout)
			clearTimeout(this._timeout);
		this._timeout = setTimeout(() => {
			callback();
			this._timeout = null;
		}, durationMs);
	}
}
