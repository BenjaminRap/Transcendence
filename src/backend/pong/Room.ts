import { DefaultSocket } from ".";
import { ServerSceneData } from "./ServerSceneData";
import { ServerPongGame } from "./ServerPongGame";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { GameInit, KeysUpdate } from "@shared/ServerMessage"

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

		const	sceneData = new ServerSceneData(new HavokPlugin(false), firstSocket, secondSocket);
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
		socket.emit("room-closed");
		socket.data.leaveGame("unactive");
	}

	private addSocketToRoom(socket : DefaultSocket, playeIndex : number)
	{
		if (socket.data.isInRoom(this))
			return ;
		const	gameInit : GameInit = {
			playerIndex: playeIndex
		}
		socket.emit("joined-game", gameInit);
		socket.data.joinGame(this);
	}
}
