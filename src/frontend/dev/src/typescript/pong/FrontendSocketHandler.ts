import { Observable } from "@babylonjs/core";
import { PongError } from "@shared/pongError/PongError";
import type { Result } from "@shared/utils";
import { io, Socket } from "socket.io-client";
import { CancellablePromise } from "./CancellablePromise";
import type { AllServerMessage, ServerMessage, ServerMessageData, ServerReservedMessage, ServerToClientEvents } from "@shared/ServerMessageHelpers";
import type { ClientMessage, ClientMessageAcknowledgement, ClientMessageData, ClientToServerEvents } from "@shared/ClientMessageHelpers";

export type DefaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type ResultType<T extends ClientMessage>
	= ClientMessageAcknowledgement<T> extends (result: Result<infer R>) => void 
		? R 
		: never;

type EventHandler = {
	observable: Observable<any>,
	callback: (...args: any[]) => void
}

export class	FrontendSocketHandler
{
	private static readonly _apiUrl = "/api/socket.io/";

	private _observables = new Map<string, Map<AllServerMessage, EventHandler>>

	public getObservable<T extends AllServerMessage>(groupName : string, event : T) : Observable<T extends ServerMessage ? ServerMessageData<T> : void>
	{
		if (!this._observables.has(groupName))
			this._observables.set(groupName, new Map());
		const	group = this._observables.get(groupName)!;

		if (!group.has(event))
		{
			const	observable = new Observable<any>();
			const	callback = (...args : any[]) => {
				observable.notifyObservers(args);
			};

			group.set(event, {observable, callback});
			this._socket.on(event, callback as any);
		}
		return group.get(event)!.observable;
	}

	public clearObservable(groupName : string)
	{
		const	group = this._observables.get(groupName);

		if (!group)
			return ;
		group.forEach((value, key) => {
			this._socket.off(key, value.callback);
		});
		this._observables.delete(groupName);
	}

	private clearObservables()
	{
		this._observables.keys().forEach(key => this.clearObservable(key));
	}

	private constructor(
		private _socket : DefaultSocket,
		public readonly guestName: string)
	{
		this.getObservable("FrontendSocketHandler", "disconnect").add(() => {
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
		this.clearObservables();
	}

	private	onDisconnectEvent()
	{
		this._socket.off();
		this.clearObservables();
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

	public sendEventWithNoResponse<T extends ClientMessage>(event : ClientMessageAcknowledgement<T> extends undefined ? T : never, ...args: Parameters<ClientToServerEvents[T]>)
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
}
