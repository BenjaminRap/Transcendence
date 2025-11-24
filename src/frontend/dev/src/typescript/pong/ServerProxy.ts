import { GameInfos, KeysUpdate } from "@shared/ServerMessage";
import { ClientMessage, ClientMessageData, MultiplayerHandler } from "./MultiplayerHandler";
import { Observable } from "@babylonjs/core/Misc/observable";

export class	ServerProxy
{
	constructor(
		private _multiplayerHandler : MultiplayerHandler,
		public readonly playerIndex : number
	) {
	}

	public keyUpdate(key : "up" | "down", event : "keyUp" | "keyDown")
	{
		const	keysUpdate : KeysUpdate =  {};

		if (key === "up")
			keysUpdate.up = { event : event };
		else
			keysUpdate.down = { event : event };
		this._multiplayerHandler.sendServerMessage("input-infos", keysUpdate);
	}

	public onServerMessage() : Observable<GameInfos | "room-closed" | "server-error"> | null
	{
		return this._multiplayerHandler.onServerMessage();
	}

	public sendServerMessage<T extends ClientMessage>(event : T, data : ClientMessageData<T>)
	{
		return this._multiplayerHandler.sendServerMessage(event, data);
	}
}
