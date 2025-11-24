import { Observable } from "@babylonjs/core/Misc/observable";
import { SocketMessage, Room } from "./Room";
import { int } from "@babylonjs/core/types";
import { ServerToClientEvents } from "@shared/MessageType";

export class	ClientProxy
{
	constructor(
		private readonly _room : Room
	) {

	}

	public sendMessageToSocket<T extends keyof ServerToClientEvents>(socketIndex : int, event : T, ...args : Parameters<ServerToClientEvents[T]>)
	{
		this._room.sendMessageToSocketByIndex(socketIndex, event, ...args);
	}

	public broadcastMessageFromSocket<T extends keyof ServerToClientEvents>(socketIndex : int, event : T, ...args : Parameters<ServerToClientEvents[T]>)
	{
		this._room.broadcastMessageFromSocket(socketIndex, event, ...args);
	}

	public sendMessageToRoom<T extends keyof ServerToClientEvents>(event : T, ...args : Parameters<ServerToClientEvents[T]>)
	{
		this._room.sendMessageToRoom(event, ...args);
	}

	public onSocketMessage(event : "input-infos") : Observable<SocketMessage>
	{
		return this._room.onSocketMessage(event);
	}
}
