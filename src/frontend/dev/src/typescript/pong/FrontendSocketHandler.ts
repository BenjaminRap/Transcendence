import { Observable } from "@babylonjs/core";
import { PongError } from "@shared/pongError/PongError";
import { type GameInfos, type GameInit } from "@shared/ZodMessageType";
import type { Result } from "@shared/utils";
import { io, Socket } from "socket.io-client";
import type { TournamentEventAndJoinedGame } from "./FrontendEventsManager";
import { CancellablePromise } from "./CancellablePromise";
import type { ServerMessage, ServerMessageData, ServerToClientEvents } from "@shared/ServerMessageHelpers";
import type { ClientMessage, ClientMessageAcknowledgement, ClientMessageData, ClientToServerEvents } from "@shared/ClientMessageHelpers";

export type EventWithNoResponse = "forfeit" | "input-infos" | "leave-matchmaking" | "ready" | "leave-tournament" | "cancel-tournament" | "ban-participant" | "kick-participant";
type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type ResultType<T extends ClientMessage>
	= ClientMessageAcknowledgement<T> extends (result: Result<infer R>) => void 
		? R 
		: never

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

	public waitForEvent<T extends ServerMessage>(event : T) : CancellablePromise<ServerMessageData<T>>
	{
		let	callback : (...args: ServerMessageData<T>) => void;

		const	promise = new CancellablePromise<ServerMessageData<T>>((resolve) => {
			callback = (...data : ServerMessageData<T>) => {
				resolve(data);
			}
			this._socket.once(event, callback as any);
		}, () => {
			this._socket.off(event, callback as any);
		});

		return promise;
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


	public sendEventWithAck<T extends ClientMessage>(
	  event: T,
	  ...args: ClientMessageData<T>
	): CancellablePromise<ResultType<T>> {

	  let ack: ((result: Result<any>) => void) | null = null;

	  const promise = new CancellablePromise<ResultType<T>>((resolve, reject) => {
		ack = (result: Result<any>) => {
			if (result.success)
				resolve(result.value);
			else
				reject(new PongError(result.error, "show"));
		};

		const params = [...args, ((result: Result<any>) => ack?.(result))];

		this._socket.emit(event, ...params as Parameters<ClientToServerEvents[T]>);
	  }, () => {
		ack = null;
	  });

	  return promise;
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
