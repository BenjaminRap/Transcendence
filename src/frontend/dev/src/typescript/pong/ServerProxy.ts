import type { GameInfos, KeysUpdate, TournamentCreationSettings, TournamentId } from "@shared/ServerMessage";
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

	public onServerMessage() : Observable<GameInfos | "room-closed" | "forfeit">
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

	public createTournament(settings : TournamentCreationSettings)
	{
		return this._frontendSocketHandler.createTournament(settings);
	}

	public joinTournament(tournamentId : TournamentId)
	{
		return this._frontendSocketHandler.joinTournament(tournamentId);
	}

	public cancelTournament()
	{
		this._frontendSocketHandler.cancelTournament();
	}

	public startTournament()
	{
		return this._frontendSocketHandler.startTournament();
	}

	public getTournaments()
	{
		return this._frontendSocketHandler.getTournaments();
	}
}
