import { ServerSceneData } from "./ServerSceneData";
import { ServerPongGame } from "./ServerPongGame";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { GameInit, KeysUpdate, ZodKeysUpdate } from "@shared/ServerMessage"
import { ClientProxy } from "./ClientProxy";
import { int, Observable } from "@babylonjs/core";
import { DefaultEventsMap, Server } from "socket.io";
import { ServerEvents, ServerToClientEvents } from "@shared/MessageType";
import { DefaultSocket } from ".";

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
		const	sceneData = new ServerSceneData(new HavokPlugin(false), clientProxy);
		this._serverPongGame = new ServerPongGame(sceneData);
	}

	public dispose()
	{
		if (this._disposed)
			return ;
		console.log("disposing room !");
		this._disposed = true;
		this._sockets.forEach((socket : DefaultSocket) => { this.removeSocketFromRoom(socket) });
		this._serverPongGame?.dispose();
		this._serverPongGame = undefined;
	}

	private removeSocketFromRoom(socket : DefaultSocket)
	{
		if (!socket.data.isInRoom(this))
			return ;
		socket.data.leaveGame();
		socket.leave(this._roomId);
		socket.emit("room-closed");
		if (socket.data.getState() === "ready")
			this._socketsReadyCount--;
	}

	private async addSocketToRoom(socket : DefaultSocket, playerIndex : number)
	{
		if (socket.data.isInRoom(this))
			return ;
		const	gameInit : GameInit = {
			playerIndex: playerIndex
		}
		socket.data.joinRoom(this);
		await socket.join(this._roomId);
		socket.emit("joined-game", gameInit);
		socket.once("ready", () => { this.setSocketReady(socket) } );
		socket.once("restart", () => { this.removeSocketFromRoom(socket) });
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

	private	startGame()
	{
		this._serverPongGame!.gameStart();
		this.sendMessageToRoom("ready");
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
				const	keysUpdate = ZodKeysUpdate.safeParse(data);
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
