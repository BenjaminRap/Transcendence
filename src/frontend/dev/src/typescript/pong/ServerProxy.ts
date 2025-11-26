import { GameInfos, KeysUpdate } from "@shared/ServerMessage";
import { MultiplayerHandler } from "./MultiplayerHandler";
import { Observable } from "@babylonjs/core/Misc/observable";
import { ClientToServerEvents } from "@shared/MessageType";

export class	ServerProxy
{
	constructor(
		private _multiplayerHandler : MultiplayerHandler,
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

	public onServerMessage() : Observable<GameInfos | "room-closed" | "server-error" | "forfeit"> | null
	{
		return this._multiplayerHandler.onServerMessage();
	}

	public sendServerMessage<T extends keyof ClientToServerEvents>(event : T, ...args : Parameters<ClientToServerEvents[T]>)
	{
		return this._multiplayerHandler.sendServerMessage(event, ...args);
	}

	public async joinGame()
	{
		return this._multiplayerHandler.joinGame();
	}

	public getPlayerIndex()
	{
		return this._multiplayerHandler.getplayerIndex();
	}

	public getOpponentIndex()
	{
		return (this.getPlayerIndex() === 0) ? 1 : 0;
	}
}
