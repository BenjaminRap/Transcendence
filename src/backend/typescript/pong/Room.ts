import { ServerSceneData } from "./ServerSceneData";
import { ServerPongGame } from "./ServerPongGame";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type GameInit, type KeysUpdate, zodKeysUpdate } from "@shared/ServerMessage"
import { ClientProxy } from "./ClientProxy";
import { type int, Observable } from "@babylonjs/core";
import { type DefaultEventsMap, Server } from "socket.io";
import type { ServerEvents, ServerToClientEvents } from "@shared/MessageType";
import type { DefaultSocket } from "../index";

export type SocketMessage = {
	socketIndex : int,
	data : KeysUpdate
}

export class	Room
{
	private _sockets : DefaultSocket[] = [];
	private _serverPongGame : ServerPongGame | undefined;
	private _disposed : boolean = false;
	private _roomId : string;
	private _observers : Map<string, Observable<SocketMessage>>;
	private _socketsReadyCount : int = 0;
	private _sceneData : ServerSceneData | undefined;
	private _ended : boolean = false;
	
	constructor(
		private readonly _io : Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
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
		for (let index = 0; index < this._sockets.length; index++) {
			const socket = this._sockets[index];

			await this.addSocketToRoom(socket, index);
		}

		const	clientProxy = new ClientProxy(this);
		this._sceneData = new ServerSceneData(new HavokPlugin(false), clientProxy);
		this._serverPongGame = new ServerPongGame(this._sceneData);
	}

	private dispose()
	{
		if (this._disposed)
			return ;
		console.log("disposing room !");
		this._io.to(this._roomId).emit("room-closed");
		this._disposed = true;
		this._sockets.forEach((socket : DefaultSocket) => { this.removeSocketFromRoom(socket) });
		this._serverPongGame?.dispose();
		this._serverPongGame = undefined;
	}

	public onSocketDisconnect(socket : DefaultSocket)
	{
		if (!socket.data.isInRoom(this) || this._ended)
			return ;
		socket.broadcast.to(this._roomId).emit("forfeit");
		this.gameEnd();
	}

	private removeSocketFromRoom(socket : DefaultSocket)
	{
		if (!socket.data.isInRoom(this))
			return ;
		socket.data.leaveRoom();
		socket.leave(this._roomId);
		socket.removeAllListeners("ready");
		socket.removeAllListeners("input-infos");
		socket.removeAllListeners("forfeit");
		if (socket.data.getState() === "ready")
			this._socketsReadyCount--;
	}

	private async addSocketToRoom(socket : DefaultSocket, playerIndex : number)
	{
		if (socket.data.isInRoom(this))
			return ;
		socket.data.joinRoom(this);
		await socket.join(this._roomId);
		const	gameInit : GameInit = {
			playerIndex: playerIndex
		}
		socket.emit("joined-game", gameInit);
		socket.once("ready", () => { this.setSocketReady(socket) } );
	}

	private	setSocketReady(socket : DefaultSocket)
	{
		if (socket.data.getState() === "ready")
			return ;
		this._socketsReadyCount++;
		socket.data.setReady();
		if (this._socketsReadyCount === 2)
			this.startGame();
	}

	private	async startGame()
	{
		await this._sceneData!.readyPromise.promise;
		this._sceneData!.events.getObservable("game-start").notifyObservers();
		this._sceneData!.events.getObservable("end").add(() => { this.gameEnd() });
		this.sendMessageToRoom("ready");
		this._sockets.forEach((socket : DefaultSocket, index : int) => {
			socket.once("forfeit", () => {
				socket.broadcast.to(this._roomId).emit("forfeit");
				const	winningSide = (index === 0) ? "left" : "right";

				this._sceneData!.events.getObservable("forfeit").notifyObservers(winningSide);
			});
		});
	}

	private gameEnd()
	{
		this._ended = true;
		setTimeout(() => {
			this.dispose();
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
			throw new Error("sendMessageToSocketByIndex called with an invalid index !");

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
			throw new Error("broadcastMessageFromSocket called with an invalid index !");

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
				{
					this.removeSocketFromRoom(socket);
					return ;
				}
				const	clientMessage : SocketMessage = {
					socketIndex : index,
					data : keysUpdate.data
				};
				observable.notifyObservers(clientMessage);
			});
		});
		return observable;
	}
}
