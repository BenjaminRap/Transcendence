import { Observable } from "@babylonjs/core/Misc/observable";
import { ClientMessage, Room } from "./Room";

export class	ClientProxy
{
	constructor(
		private readonly _room : Room
	) {

	}

	public sendMessageToSocket(socket : "first" | "second", event : string, data? : any)
	{
		this._room.sendMessageToSocket(socket, event, data);
	}

	public sendMessageToRoom(event : string, data? : any)
	{
		this._room.sendMessageToRoom(event, data);
	}

	public onSocketMessage(event : string) : Observable<ClientMessage>
	{
		return this._room.onSocketMessage(event);
	}
}
