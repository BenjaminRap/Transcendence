import { Deferred, type int, Observable } from "@babylonjs/core";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/MessageType";
import type { Profile } from "@shared/Profile";
import { type GameInfos, type TournamentCreationSettings, type TournamentDescription, type TournamentId, zodGameInit } from "@shared/ServerMessage";
import type { Result } from "@shared/utils";
import { io, Socket } from "socket.io-client";

type ServerInGameMessage = GameInfos | "forfeit" | "room-closed";
type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type SocketState = "not-connected" | "connected" | "in-matchmaking" | "in-game" | "tournament-creator" | "tournament-player" | "tournament-creator-player" | "in-tournament";

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
		this.replaceCurrentPromise(deferred);
		this._state = "in-matchmaking";
		this._socket.emit("join-matchmaking");
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

		this.replaceCurrentPromise(deferred);
		this._socket.emit("get-tournaments", (tournamentDescriptions : TournamentDescription[]) => {
			deferred.resolve(tournamentDescriptions);
		});
		return deferred.promise;
	}

	public leaveScene()
	{
		this.verifyState("connected", "in-matchmaking", "in-game", "in-tournament");
		this._onServerMessageObservable.clear();
		if (this._state === "in-matchmaking")
			this._socket.emit("leave-matchmaking");
		else if (this._state === "in-game")
			this._socket.emit("forfeit");
		else if (this._state === "in-tournament")
			this._socket.emit("leave-tournament");
		this._state = "connected";
		this._currentPromise?.reject("canceled");
	}

	public	leaveMatchmaking()
	{
		this.verifyState("in-matchmaking");
		this._socket.emit("leave-matchmaking");
		this._state = "connected";
		this._currentPromise?.reject("canceled");
	}

	private	replaceCurrentPromise(newPromise : Deferred<any>)
	{
		this._currentPromise?.reject("canceled");
		this._currentPromise = newPromise;
	}

	public async	onGameReady() : Promise<void>
	{
		this.verifyState("in-game");
		const	deferred = new Deferred<void>();

		this._socket.once("ready", () => {
			deferred.resolve();
		});
		this.replaceCurrentPromise(deferred);
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

	public createTournament(settings : TournamentCreationSettings)
	{
		this.verifyState("connected");
		const	deferred = new Deferred<TournamentId>();
		this.replaceCurrentPromise(deferred);
		this._state = "tournament-creator";
		this._socket.emit("create-tournament", settings, (tournamentId : Result<string>) => {
			if (tournamentId.success)
				deferred.resolve(tournamentId.value);
			else
			{
				this._state = "connected";
				deferred.reject(tournamentId.error);
			}
		});
		return deferred.promise;
	}

	public cancelTournament()
	{
		this.verifyState("tournament-creator", "tournament-creator-player");
		this._currentPromise?.reject();
		this._state = "connected";
		this._socket.emit("cancel-tournament");
	}

	public startTournament()
	{
		this.verifyState("tournament-creator", "tournament-creator-player");
		const	previousState = this._state;
		const	deferred = new Deferred<void>();

		this.replaceCurrentPromise(deferred);
		this._state = "in-tournament";
		this._socket.emit("start-tournament", (result : Result<null>) => {
			if (result.success)
				deferred.resolve();
			else
			{
				this._state = previousState;
				deferred.reject(result.error);
			}
		});
		return deferred.promise;
	}

	public joinTournament(tournamentId : TournamentId)
	{
		this.verifyState("connected", "tournament-creator");
		const	previousState = this._state;
		const	deferred = new Deferred<Profile[]>();

		this.replaceCurrentPromise(deferred);
		if (this._state === "connected")
			this._state = "tournament-player";
			else
			this._state = "tournament-creator-player"
		this._socket.emit("join-tournament", tournamentId, (participants : Result<Profile[]>) => {
			if (participants.success)
				deferred.resolve(participants.value);
			else
			{
				this._state = previousState;
				deferred.reject(participants.error);
			}
		});
		return deferred.promise;
	}

	public leaveTournament()
	{
		this.verifyState("tournament-player", "tournament-creator-player", "in-tournament");
		if (this._state === "tournament-player" || this._state === "in-tournament")
			this._state = "connected";
		else
			this._state = "tournament-creator"
		this._socket.emit("leave-tournament");
	}
}

function	createNewOnServerMessageObservable(socket : DefaultSocket)
{
	const	observable = new Observable<ServerInGameMessage>();

	socket.on("game-infos", (gameInfos : GameInfos) => { observable.notifyObservers(gameInfos) });
	socket.on("forfeit", () => { observable.notifyObservers("forfeit") });
	socket.on("room-closed", () => { observable.notifyObservers("room-closed") });
	return observable;
}
