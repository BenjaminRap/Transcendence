import { Deferred, type int, Observable } from "@babylonjs/core";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/MessageType";
import { type GameInfos, type TournamentCreationSettings, type TournamentDescription, zodGameInfos, zodGameInit } from "@shared/ServerMessage";
import { io, Socket } from "socket.io-client";

type ServerInGameMessage = GameInfos | "forfeit" | "room-closed";
type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type SocketState = "not-connected" | "connected" | "in-matchmaking" | "in-game" | "tournament-creation";

export class	FrontendSocketHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _state : SocketState;
	private _socket : DefaultSocket;
	private _onServerMessageObservable : Observable<ServerInGameMessage>;
	private _playerIndex : int = 0;
	private _currentPromise : Deferred<any> | null = null

	private constructor(socket : DefaultSocket)
	{
		this._state = "connected";
		this._socket = socket;
		this._onServerMessageObservable = createNewOnServerMessageObservable(socket);
		socket.on("room-closed", () => {
			if (this._state === "in-game")
				this._state = "connected";
		});
		socket.on("disconnect", () => { this.onDisconnectEvent() });
	}

	public static async createFrontendSocketHandler()
	{
		const socket = io("/", {
			path: FrontendSocketHandler._apiUrl,
			autoConnect: false
		});

		const	connectionPromise = new Promise<void>((resolve, reject) => {
			socket.once("connect", () => {
				socket.off("connect_error");
				resolve();
			});
			socket!.once("connect_error", (error : Error) => {
				socket.off("connect");
				reject(error);
			});
		});
		socket.connect();

		await connectionPromise;
		const	frontendSocketHandler = new FrontendSocketHandler(socket);

		return frontendSocketHandler;
	}

	public async joinGame() : Promise<void>
	{
		this.verifyState("connected");
		this._state = "in-matchmaking";
		const	deferred = new Deferred<void>();

		this._socket.once("joined-game", (data : any) => {
			const	gameInit = zodGameInit.safeParse(data);

			if (!gameInit.success)
			{
				this._state = "connected";
				deferred.reject("Server sent wrong data !");
			}
			else
			{
				this._state = "in-game";
				this._playerIndex = gameInit.data.playerIndex;
				deferred.resolve();
			}
		});
		this._socket.emit("join-matchmaking");
		this._currentPromise = deferred;
		return deferred.promise;
	}

	public disconnect()
	{
		if (this._state === "not-connected")
			return ;
		this._state = "not-connected";
		this._socket.off();
		this._socket.disconnect();
		this._onServerMessageObservable.clear();
		this._currentPromise?.reject("canceled");
	}

	private	onDisconnectEvent()
	{
		if (this._state === "not-connected")
			return ;
		this._state = "not-connected";
		this._currentPromise?.reject();
		this._socket.off();
		this._onServerMessageObservable.clear();
	}

	public getTournaments()
	{
		this.verifyState("connected");
		const	deferred = new Deferred<TournamentDescription[]>();

		this._currentPromise = deferred;
		this._socket.emit("get-tournaments", (tournamentDescriptions : TournamentDescription[]) => {
			deferred.resolve(tournamentDescriptions);
		});
		return deferred.promise;
	}

	public leaveScene()
	{
		this.verifyState("connected", "in-matchmaking", "in-game");
		this._onServerMessageObservable.clear();
		if (this._state === "in-matchmaking")
			this._socket.emit("leave-matchmaking");
		else if (this._state === "in-game")
			this._socket.emit("forfeit");
		this._state = "connected";
		this._currentPromise?.reject("canceled");
	}

	public	leaveMatchmaking()
	{
		console.log("leave-matchamking");
		this.verifyState("in-matchmaking");
		this._socket.emit("leave-matchmaking");
		this._state = "connected";
		this._currentPromise?.reject("canceled");
	}

	public async	onGameReady() : Promise<void>
	{
		this.verifyState("in-game");
		const	deferred = new Deferred<void>();

		this._socket.once("ready", () => {
			deferred.resolve();
		});
		this._currentPromise = deferred;
		return deferred.promise;
	}

	public onServerMessage() : Observable<ServerInGameMessage>
	{
		return (this._onServerMessageObservable);
	}

	public	setReady()
	{
		this.verifyState("in-game");
		this._socket.emit("ready");
	}

	public sendServerMessage<T extends keyof ClientToServerEvents>(event : T, ...args: Parameters<ClientToServerEvents[T]>)
	{
		if (this._state !== "in-game")
			return ;
		this._socket.emit(event, ...args);
	}

	public getplayerIndex()
	{
		return this._playerIndex;
	}

	private verifyState(...allowedStates : SocketState[])
	{
		if (!allowedStates.includes(this._state))
			throw new Error(`A FrontendSocketHandler method called with an invalid state, current state : ${this._state}, allowed : ${allowedStates}`);
	}
}

function	createNewOnServerMessageObservable(socket : DefaultSocket)
{
	const	observable = new Observable<ServerInGameMessage>();

	socket.on("game-infos", (data : any) => {
		const	gameInfos = zodGameInfos.safeParse(data);

		if (!gameInfos.success)
			observable.notifyObservers("server-error");
		else
			observable.notifyObservers(gameInfos.data);
	});
	socket.on("forfeit", () => { observable.notifyObservers("forfeit") });
	socket.on("room-closed", () => { observable.notifyObservers("room-closed") });
	return observable;
}
