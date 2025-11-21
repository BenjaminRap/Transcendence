import { Observable } from "@babylonjs/core/Misc/observable";
import { ClientMessage, Room, ServerEvents, ServerEventsData } from "./Room";

export class	ClientProxy
{
	constructor(
		private readonly _room : Room
	) {

	}

	public sendMessageToSocket<T extends ServerEvents>(socket : "first" | "second", event : T, data : ServerEventsData<T>)
	{
		this._room.sendMessageToSocket(socket, event, data);
	}

	public sendMessageToRoom<T extends ServerEvents>(event : T, data : ServerEventsData<T>)
	{
		this._room.sendMessageToRoom(event, data);
	}

	public onSocketMessage(event : "input-infos") : Observable<ClientMessage>
	{
		return this._room.onSocketMessage(event);
	}
}
