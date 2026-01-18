import { Deferred, Observable } from "@babylonjs/core";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/MessageType";
import { PongError } from "@shared/pongError/PongError";
import type { Profile } from "@shared/Profile";
import { type GameInfos, type GameInit, type TournamentCreationSettings, type TournamentDescription, type TournamentEvent, type TournamentId, zodGameInit } from "@shared/ServerMessage";
import type { Result } from "@shared/utils";
import { io, Socket } from "socket.io-client";

export type EventWithNoResponse = "forfeit" | "input-infos" | "leave-matchmaking" | "ready" | "leave-tournament" | "cancel-tournament" | "ban-participant" | "kick-participant";
type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class	FrontendSocketHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _socket : DefaultSocket;
	private _onGameMessageObservable : Observable<GameInfos>;
	private _onDisconnectObservable  = new Observable<void>();
	private _onTournamentEventObservable : Observable<TournamentEvent>;

	private constructor(socket : DefaultSocket)
	{
		this._socket = socket;
		this._onGameMessageObservable = createNewOnGameMessageObservable(socket);
		this._onTournamentEventObservable = createNewOnTournamentMessageObservable(socket);
		this._onDisconnectObservable.add(() => {
			this.onDisconnectEvent();
		})
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

	public joinGame() : Deferred<GameInit>
	{
		const	deferred = new Deferred<GameInit>();

		this._socket.once("joined-game", (data : any) => {
			const	gameInit = zodGameInit.safeParse(data);

			if (!gameInit.success)
				deferred.reject(new PongError(`Server sent wrong data ! : ${gameInit.error}`, "ignore"));
			else
				deferred.resolve(gameInit.data);
		});
		this._socket.emit("join-matchmaking");
		return deferred;
	}

	public disconnect()
	{
		this._socket.disconnect();
		this._onDisconnectObservable.notifyObservers();
	}

	private	onDisconnectEvent()
	{
		this._socket.off();
		this._onGameMessageObservable.clear();
	}

	public getTournaments() : Deferred<TournamentDescription[]>
	{
		const	deferred = new Deferred<TournamentDescription[]>();

		this._socket.emit("get-tournaments", (tournamentDescriptions : TournamentDescription[]) => {
			deferred.resolve(tournamentDescriptions);
		});
		return deferred;
	}

	public onGameReady() : Deferred<void>
	{
		const	deferred = new Deferred<void>();

		this._socket.once("ready", () => {
			deferred.resolve();
		});
		return deferred;
	}

	public onGameMessage() : Observable<GameInfos>
	{
		return this._onGameMessageObservable;
	}

	public sendEventWithNoResponse<T extends EventWithNoResponse>(event : T, ...args: Parameters<ClientToServerEvents[T]>)
	{
		this._socket.emit(event, ...args);
	}

	public createTournament(settings : TournamentCreationSettings) : Deferred<TournamentId>
	{
		const	deferred = new Deferred<TournamentId>();
		this._socket.emit("create-tournament", settings, (tournamentId : Result<string>) => {
			if (tournamentId.success)
				deferred.resolve(tournamentId.value);
			else
				deferred.reject(new PongError(tournamentId.error, "show"));
		});
		return deferred;
	}

	public startTournament() : Deferred<void>
	{
		const	deferred = new Deferred<void>();

		this._socket.emit("start-tournament", (result : Result<null>) => {
			if (result.success)
				deferred.resolve();
			else
				deferred.reject(new PongError(result.error, "show"));
		});
		return deferred;
	}

	public joinTournament(tournamentId : TournamentId) : Deferred<Profile[]>
	{
		const	deferred = new Deferred<Profile[]>();

		this._socket.emit("join-tournament", tournamentId, (participants : Result<Profile[]>) => {
			if (participants.success)
				deferred.resolve(participants.value);
			else
				deferred.reject(new PongError(participants.error, "show"));
		});
		return deferred;
	}

	public onDisconnect()
	{
		return this._onDisconnectObservable;
	}

	public onTournamentMessage()
	{
		return this._onTournamentEventObservable;
	}
}

function	createNewOnGameMessageObservable(socket : DefaultSocket)
{
	const	observable = new Observable<GameInfos>();

	socket.on("game-infos", (gameInfos : GameInfos) => { observable.notifyObservers(gameInfos) });
	return observable;
}

function	createNewOnTournamentMessageObservable(socket : DefaultSocket)
{
	const	observable = new Observable<TournamentEvent>();

	socket.on("tournament-event", tournamentEvent => observable.notifyObservers(tournamentEvent));
	return observable;
}
