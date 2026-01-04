import type { EndData } from "@shared/attachedScripts/GameManager";
import { Tournament } from "@shared/Tournament"

export class	ServerTournament extends Tournament
{
	private	_disposed = false;

	constructor(
		private _onTournamentDispose : () => void
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
}
