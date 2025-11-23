import { Observable } from "@babylonjs/core";
import { GameInfos, GameInit, KeysUpdate, ZodGameInfos, ZodGameInit } from "@shared/ServerMessage";
import { io, Socket } from "socket.io-client";

export class	MultiplayerHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _socket  : Socket | null = null;
	private _onServerMessageObservable : Observable<GameInfos | "room-closed" | "server-error"> | null = null;

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

	public async joinGame() : Promise<GameInit>
	{
		this._socket!.emit("join-matchmaking");
		return new Promise((resolve, reject) => {
			this._socket!.once("joined-game", (data : any) => {
				const	gameInit = ZodGameInit.safeParse(data);

				if (!gameInit.success)
					reject("Server sent wrong data !");
				else
					resolve(gameInit.data);
			});
			this._socket!.once("disconnect", (reason) => {
				reject(reason);
			});
		});
	}

	public async	onGameReady() : Promise<void>
	{
		return new Promise((resolve, reject) => {
			this._socket!.once("ready", () => {
				resolve();
			});
			this._socket!.once("disconnect", (reason) => {
				reject(reason);
			});
		});
	}

	public onServerMessage() : Observable<GameInfos | "room-closed" | "server-error"> | null
	{
		if (this._onServerMessageObservable !== null)
			return (this._onServerMessageObservable);
		if (this._socket === null)
			return null;
		const	observable = new Observable<GameInfos | "room-closed" | "server-error">();

		this._socket.on("game-infos", (data : any) => {
			const	gameInfos = ZodGameInfos.safeParse(data);

			if (!gameInfos.success)
				this.stopListeningToGameInfos("server-error");
			else
				observable.notifyObservers(gameInfos.data);
		});
		this._socket.once("room-closed", () => { this.stopListeningToGameInfos("room-closed") });
		this._onServerMessageObservable = observable;
		return observable;
	}

	private	stopListeningToGameInfos(reason : "room-closed" | "server-error")
	{
		if (this._socket !== null)
			this._socket.off("game-infos");
		if (!this._onServerMessageObservable)
			return ;
		this._onServerMessageObservable.notifyObservers(reason);
		this._onServerMessageObservable.clear();
		this._onServerMessageObservable = null;
	}

	public sendServerInputs(keysUpdate : KeysUpdate)
	{
		if (this._socket === null)
			return ;
		this._socket.emit("input-infos", keysUpdate);
	}

	public	setReady()
	{
		this._socket?.emit("ready");
	}
}
