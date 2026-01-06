import type { TournamentCreationSettings, TournamentDescription } from "@shared/ServerMessage";
import type { DefaultSocket } from "..";

export class	ServerTournament
{
	private	_disposed = false;
	private _players : DefaultSocket[] = [];
	private _tournamentId : string;

	constructor(
		private _onTournamentDispose : () => void,
		private readonly _settings : TournamentCreationSettings
	)
	{
		this._tournamentId = crypto.randomUUID();
	}

	public start()
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
			maxPlayerCount: this._settings.maxPlayerCount,
			id: this._tournamentId
		}
	}
}
