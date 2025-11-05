import { DefaultSocket } from ".";
import { ServerPongGame } from "./ServerPongGame";

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
		this.addSocketToRoom(firstSocket);
		this.addSocketToRoom(secondSocket);;
		this._serverPongGame = new ServerPongGame();
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

	private addSocketToRoom(socket : DefaultSocket)
	{
		if (socket.data.isInRoom(this))
			return ;
		socket.emit("joined-game");
		socket.data.joinGame(this);
	}
}
