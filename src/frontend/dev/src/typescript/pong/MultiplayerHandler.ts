import { Observable } from "@babylonjs/core";
import { io, Socket } from "socket.io-client";

export class	MultiplayerHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _socket  : Socket | null = null;
	private _onServerMessageObservable : Observable<any | "room-closed"> | null = null;

	public async connect() : Promise<void>
	{
		if (this._socket != null)
			return ;
		this._socket = io("/", {
			path:MultiplayerHandler._apiUrl
		});

		return new Promise((resolve, reject) => {
			this._socket!.once("connect", () => {
				this._socket!.once("disconnect", () => {
					this.disconnect();
				});
				resolve();
			});
			this._socket!.once("connect_error", (error : Error) => {
				this.disconnect();
				reject(error);
			});
		});
	}

	public disconnect()
	{
		if (!(this._socket))
			return ;
		this._socket.disconnect();
		this._socket = null;
		this._onServerMessageObservable?.clear();
		this._onServerMessageObservable = null;
	}

	public async joinGame() : Promise<void>
	{
		if (this._socket === null)
			await this.connect();
		this._socket!.emit("join-matchmaking");
		return new Promise((resolve, reject) => {
			this._socket!.once("joined-game", () => {
				resolve();
			});
			this._socket!.once("disconnect", (reason) => {
				reject(reason);
			});
		});
	}

	public onServerMessage() : Observable<any | "room-closed"> | null
	{
		if (this._onServerMessageObservable !== null)
			return (this._onServerMessageObservable);
		if (this._socket === null)
			return null;
		const	observable = new Observable<any | "room-closed">();

		this._socket.on("game-infos", (gameInfos : any) => {
			observable.notifyObservers(gameInfos);
		});
		this._socket.once("room-closed", () => {
			observable.notifyObservers("room-closed");
			observable.clear();
			if (this._socket === null)
				return ;
			this._socket.off("game-infos");
		});
		this._onServerMessageObservable = observable;
		return observable;
	}
}
