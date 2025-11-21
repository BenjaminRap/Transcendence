import { GameInfos, KeysUpdate } from "@shared/ServerMessage";
import { MultiplayerHandler } from "./MultiplayerHandler";
import { Observable } from "@babylonjs/core/Misc/observable";

export class	ServerCommunicationHandler
{
	constructor(
		private multiplayerHandler : MultiplayerHandler,
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
		this.multiplayerHandler.sendServerInputs(keysUpdate);
	}

	public onServerMessage() : Observable<GameInfos | "room-closed"> | null
	{
		return this.multiplayerHandler.onServerMessage();
	}
}
