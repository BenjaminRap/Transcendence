import type { EndData } from "@shared/attachedScripts/GameManager";
import type { TournamentCreationSettings, TournamentDescription } from "@shared/ServerMessage";
import { Tournament } from "@shared/Tournament"
import type { DefaultSocket } from "..";

export class	ServerTournament extends Tournament
{
	private	_disposed = false;
	private _players : DefaultSocket[] = [];

	constructor(
		private _onTournamentDispose : () => void,
		private readonly _settings : TournamentCreationSettings
	)
	{
		super();
	}

	public start()
	{
		throw new Error("Method not implemented.");
	}

	public onGameEnd(endData: EndData)
	{
		throw new Error("Method not implemented.");
	}

	public dispose()
	{
		if (this._disposed)
			return ;
		this._disposed = true;
		this._onTournamentDispose();
	}

	public getDescriptionIfPublic() : TournamentDescription | null
	{
		if (!this._settings.isPublic)
			return null;
		return {
			name: this._settings.name,
			currentPlayerCount: this._players.length,
			maxPlayerCount: this._settings.maxPlayerCount
		}
	}
}
