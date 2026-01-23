import { Deferred, Observable } from "@babylonjs/core";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/MessageType";
import { PongError } from "@shared/pongError/PongError";
import { type GameInfos, type GameInit, type GameStartInfos, type Profile, type TournamentCreationSettings, type TournamentDescription, type TournamentEvent, type TournamentId, zodGameInit } from "@shared/ServerMessage";
import type { Result } from "@shared/utils";
import { io, Socket } from "socket.io-client";
import type { TournamentEventAndJoinedGame } from "./FrontendEventsManager";

export type EventWithNoResponse = "forfeit" | "input-infos" | "leave-matchmaking" | "ready" | "leave-tournament" | "cancel-tournament" | "ban-participant" | "kick-participant";
type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class	FrontendSocketHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _onGameMessageObservable = new Observable<GameInfos>();
	private _onDisconnectObservable  = new Observable<void>();
	private _onTournamentEventObservable = new Observable<TournamentEventAndJoinedGame>();
	private _onGameJoinObservable = new Observable<GameInit>();

	private constructor(
		private _socket : DefaultSocket,
		public readonly guestName: string)
	{
		this._socket.on("game-infos", gameInfos => { this._onGameMessageObservable.notifyObservers(gameInfos) });
		this._socket.on("tournament-event", tournamentEvent => this._onTournamentEventObservable.notifyObservers(tournamentEvent));
		this._socket.on("joined-game", gameInit => this._onGameJoinObservable.notifyObservers(gameInit));
		this._onDisconnectObservable.add(() => {
			this.onDisconnectEvent();
		});
	}

	public static async createFrontendSocketHandler()
	{
        const socket : DefaultSocket = io("/", {
            path: FrontendSocketHandler._apiUrl,
            autoConnect: false,
        });

		const	connectionPromise = new Promise<string>((resolve, reject) => {
			socket.once("connect", () => {
				socket.off("connect_error");
			});
			socket.once("connect_error", (error : Error) => {
				socket.off("connect");
				reject(error);
			});
			socket.once("init", guestName => {
				resolve(guestName);
			});
		});
		socket.connect();

		const	guestName = await connectionPromise;
		const	frontendSocketHandler = new FrontendSocketHandler(socket, guestName);

		return frontendSocketHandler;
	}

	public joinGame() : Deferred<GameInit>
	{
		const	deferred = new Deferred<GameInit>();

		this._socket.once("joined-game", (data : any) => {
			const	gameInit = zodGameInit.safeParse(data);

			if (!gameInit.success)
				deferred.reject(new PongError(`Server sent wrong data ! : ${gameInit.error}`, "quitPong"));
			else
				deferred.resolve(gameInit.data);
		});
		this._socket.emit("join-matchmaking");
		return deferred;
	}

	public get socket() : DefaultSocket
	{
		return this._socket;
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

	public onGameReady() : Deferred<GameStartInfos>
	{
		const	deferred = new Deferred<GameStartInfos>();

		this._socket.once("ready", (gameStartInfos) => {
			deferred.resolve(gameStartInfos);
		});
		return deferred;
	}

	public onGameMessage() : Observable<GameInfos>
	{
		return this._onGameMessageObservable;
	}
	
	public onJoinGame() : Observable<GameInit>
	{
		return this._onGameJoinObservable;
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

	public setAlias(newAlias : string) : Deferred<void>
	{
		const	deferred = new Deferred<void>();
		this._socket.emit("set-alias", newAlias, (result : Result<null>) => {
			if (result.success)
				deferred.resolve();
			else
				deferred.reject(new PongError(result.error, "show"));
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
