import type { GameInfos, KeysUpdate } from "@shared/ServerMessage";
import { FrontendSocketHandler } from "./FrontendSocketHandler";
import { Observable } from "@babylonjs/core/Misc/observable";
import type { ClientToServerEvents } from "@shared/MessageType";

export class	ServerProxy
{
	constructor(
		private _frontendSocketHandler : FrontendSocketHandler,
	) {
	}

	public keyUpdate(key : "up" | "down", event : "keyUp" | "keyDown")
	{
		const	keysUpdate : KeysUpdate =  {};

		if (key === "up")
			keysUpdate.up = { event : event };
		else
			keysUpdate.down = { event : event };
		this._frontendSocketHandler.sendServerMessage("input-infos", keysUpdate);
	}

	public onServerMessage() : Observable<GameInfos | "room-closed" | "server-error" | "forfeit"> | null
	{
		return this._frontendSocketHandler.onServerMessage();
	}

	public sendServerMessage<T extends keyof ClientToServerEvents>(event : T, ...args : Parameters<ClientToServerEvents[T]>)
	{
		return this._frontendSocketHandler.sendServerMessage(event, ...args);
	}

	public getPlayerIndex()
	{
		return this._frontendSocketHandler.getplayerIndex();
	}

	public getOpponentIndex()
	{
		return (this.getPlayerIndex() === 0) ? 1 : 0;
	}
}
