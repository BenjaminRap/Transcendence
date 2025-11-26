import { int, Observable } from "@babylonjs/core";
import { ClientToServerEvents, ServerToClientEvents } from "@shared/MessageType";
import { GameInfos, ZodGameInfos, ZodGameInit } from "@shared/ServerMessage";
import { io, Socket } from "socket.io-client";

export class	MultiplayerHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _socket  : Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
	private _onServerMessageObservable : Observable<GameInfos | "server-error" | "forfeit"> | null = null;
	private _playerIndex : int | undefined;

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
		await this.connect();
		this._socket!.emit("join-matchmaking");
		return new Promise((resolve, reject) => {
			this._socket!.once("joined-game", (data : any) => {
				const	gameInit = ZodGameInit.safeParse(data);

				if (!gameInit.success)
					reject("Server sent wrong data !");
				else
				{
					this._playerIndex = gameInit.data.playerIndex;
					resolve();
				}
			});
			this._socket!.once("disconnect", (reason) => {
				reject(reason);
			});
		});
	}

	private async connect() : Promise<void>
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

	public onServerMessage() : Observable<GameInfos | "server-error" | "forfeit"> | null
	{
		if (this._onServerMessageObservable !== null)
			return (this._onServerMessageObservable);
		if (this._socket === null)
			return null;
		const	observable = new Observable<GameInfos | "server-error" | "forfeit">();

		this._socket.on("game-infos", (data : any) => {
			const	gameInfos = ZodGameInfos.safeParse(data);

			if (!gameInfos.success)
				observable.notifyObservers("server-error");
			else
				observable.notifyObservers(gameInfos.data);
		});
		this._socket.on("forfeit", () => { observable.notifyObservers("forfeit") });
		this._onServerMessageObservable = observable;
		return observable;
	}

	public	setReady()
	{
		this._socket?.emit("ready");
	}

	public sendServerMessage<T extends keyof ClientToServerEvents>(event : T, ...args: Parameters<ClientToServerEvents[T]>)
	{
		this._socket?.emit(event, ...args);
	}

	public getplayerIndex()
	{
		return this._playerIndex;
	}
}
