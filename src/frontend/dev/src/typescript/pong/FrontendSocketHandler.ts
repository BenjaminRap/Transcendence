import { Observable } from "@babylonjs/core";
import type { ClientMessage, ClientMessageAcknowledgement, ClientMessageData, ClientMessageParameters, ClientToServerEvents, ServerToClientEvents } from "@shared/MessageType";
import { PongError } from "@shared/pongError/PongError";
import { type GameInfos, type GameInit, type GameStartInfos, zodGameInit } from "@shared/ZodMessageType";
import type { Result } from "@shared/utils";
import { io, Socket } from "socket.io-client";
import type { TournamentEventAndJoinedGame } from "./FrontendEventsManager";
import { CancellablePromise } from "./CancellablePromise";

export type EventWithNoResponse = "forfeit" | "input-infos" | "leave-matchmaking" | "ready" | "leave-tournament" | "cancel-tournament" | "ban-participant" | "kick-participant";
type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type ResultType<T extends ClientMessage>
	= ClientMessageAcknowledgement<T> extends (result: Result<infer R>) => void 
		? R 
		: never

type AckResult<T extends ClientMessage> =
  ClientMessageAcknowledgement<T> extends (result: Result<infer R>) => void ? R : never;

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

	public joinGame() : CancellablePromise<GameInit>
	{
		let	callback : (data : any) => void;
		let	ack : ((result : Result<null>) => void) | null = null;

		const	promise = new CancellablePromise<GameInit>((resolve, reject) => {
			callback = (data : any) => {
				const	gameInit = zodGameInit.safeParse(data);

				if (!gameInit.success)
					reject(new PongError(`Server sent wrong data ! : ${gameInit.error}`, "quitPong"));
				else
					resolve(gameInit.data);
			};
			ack = (result : Result<null>) => {
				if (result.success)
					return ;
				this._socket.off("joined-game");
				reject(new PongError(result.error, "show"));
			};
			this._socket.once("joined-game", callback);
			this._socket.emit("join-matchmaking", result => ack?.(result));
		}, () => {
			this._socket.off("joined-game", callback);
			ack = null;
		});

		return promise;
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

	public onGameReady() : CancellablePromise<GameStartInfos>
	{
		let	ack : ((gameStartInfos : GameStartInfos) => void);

		const	promise = new CancellablePromise<GameStartInfos>((resolve) => {
			ack = gameStartInfos => {
				resolve(gameStartInfos);
			}
			this._socket.once("ready", ack);
		}, () => {
			this._socket.off("ready", ack);
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
	): CancellablePromise<any> {

	  let ack: ((result: Result<any>) => void) | null = null;

	  const promise = new CancellablePromise((resolve, reject) => {
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
