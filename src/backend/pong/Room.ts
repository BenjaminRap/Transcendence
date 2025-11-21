import { DefaultSocket } from ".";
import { ServerSceneData } from "./ServerSceneData";
import { ServerPongGame } from "./ServerPongGame";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { GameInit } from "@shared/ServerMessage"
import { ClientProxy } from "./ClientProxy";
import { Observable } from "@babylonjs/core";

export type ClientMessage = {
	socket : "first" | "second",
	data : any
}

export class	Room
{
	private _firstSocket : DefaultSocket;
	private _secondSocket : DefaultSocket;
	private _serverPongGame : ServerPongGame;
	private _disposed : boolean = false;

	constructor(firstSocket : DefaultSocket, secondSocket : DefaultSocket)
	{
		this._firstSocket = firstSocket;
		this._secondSocket = secondSocket;
		this.addSocketToRoom(firstSocket, 0);
		this.addSocketToRoom(secondSocket, 1);;

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
		this.removeSocketFromRoom(this._firstSocket);
		this.removeSocketFromRoom(this._secondSocket);
		this._serverPongGame.dispose();
	}

	private removeSocketFromRoom(socket : DefaultSocket)
	{
		if (!socket.data.isInRoom(this))
			return ;
		this.sendMessageToSocketInternal(socket, "room-closed");
		socket.data.leaveGame("unactive");
	}

	private addSocketToRoom(socket : DefaultSocket, playeIndex : number)
	{
		if (socket.data.isInRoom(this))
			return ;
		const	gameInit : GameInit = {
			playerIndex: playeIndex
		}
		this.sendMessageToSocketInternal(socket, "joined-game", gameInit);
		socket.data.joinGame(this);
	}

	private sendMessageToSocketInternal(socket : DefaultSocket, event : string, data? : any)
	{
		socket.emit(event, data);
	}

	public sendMessageToRoom(event : string, data? : any)
	{
		this.sendMessageToSocketInternal(this._firstSocket, event, data);
		this.sendMessageToSocketInternal(this._secondSocket, event, data);
	}

	public sendMessageToSocket(socket : "first" | "second", event : string, data? : any)
	{
		if (socket === "first")
			this.sendMessageToSocketInternal(this._firstSocket, event, data);
		else
			this.sendMessageToSocketInternal(this._secondSocket, event, data);
	}

	public onSocketMessage(event : string) : Observable<ClientMessage>
	{
		const	observable = new Observable<ClientMessage>();

		this._firstSocket.on(event, (data : any) => { observable.notifyObservers({ socket : "first", data : data }) });
		this._secondSocket.on(event, (data : any) => { observable.notifyObservers({ socket : "second", data : data }) });
		
		return observable;
	}
}
