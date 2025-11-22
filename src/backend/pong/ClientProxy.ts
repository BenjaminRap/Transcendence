import { Observable } from "@babylonjs/core/Misc/observable";
import { SocketMessage, Room, ServerEvents, ServerEventsData } from "./Room";
import { int } from "@babylonjs/core/types";

export class	ClientProxy
{
	constructor(
		private readonly _room : Room
	) {

	}

	public sendMessageToSocket<T extends ServerEvents>(socketIndex : int, event : T, data : ServerEventsData<T>)
	{
		this._room.sendMessageToSocketByIndex(socketIndex, event, data);
	}

	public broadcastMessageFromSocket<T extends ServerEvents>(socketIndex : int, event : T, data : ServerEventsData<T>)
	{
		this._room.broadcastMessageFromSocket(socketIndex, event, data);
	}

	public sendMessageToRoom<T extends ServerEvents>(event : T, data : ServerEventsData<T>)
	{
		this._room.sendMessageToRoom(event, data);
	}

	public onSocketMessage(event : "input-infos") : Observable<SocketMessage>
	{
		return this._room.onSocketMessage(event);
	}
}
