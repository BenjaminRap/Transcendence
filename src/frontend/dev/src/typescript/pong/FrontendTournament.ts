import type { TournamentCreationSettings, TournamentId } from "@shared/ServerMessage";
import type { ServerProxy } from "./ServerProxy";
import type { Profile } from "@shared/Profile";
import { error, success, type Result } from "@shared/utils";

export class	FrontendTournament
{
	private constructor(
		private _serverProxy : ServerProxy,
		private _isCreator : boolean,
		private _tournamentId : TournamentId,
		private _participants : Profile[])
	{
	}

	public static async createTournament(serverProxy : ServerProxy, settings : TournamentCreationSettings) : Promise<Result<FrontendTournament>>
	{
		try {
			const	tournamentId = await serverProxy.createTournament(settings);
			const	tournament = new FrontendTournament(serverProxy, true, tournamentId, []);

			return success(tournament);
		} catch (e) {
			if (typeof e === "string")
				return error(e);
			throw e;
		}
	}

	public static async joinTournament(serverProxy : ServerProxy, tournamentId : string) : Promise<Result<FrontendTournament>>
	{
		try {
			const	participants = await serverProxy.joinTournament(tournamentId);
			const	tournament = new FrontendTournament(serverProxy, false, tournamentId, participants);

			return success(tournament);
		} catch (e) {
			if (typeof e === "string")
				return error(e);
			throw e;
		}
	}
}
