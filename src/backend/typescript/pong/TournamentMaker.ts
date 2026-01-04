import type { TournamentCreationSettings } from "@shared/ServerMessage";
import { ServerTournament } from "./ServerTournament";

const	tournaments = new Set<ServerTournament>();

export class	TournamentMaker
{
	constructor()
	{

	}

	public createTournament(settings : TournamentCreationSettings)
	{
		const	tournament = new ServerTournament(() => tournaments.delete(tournament));

		tournaments.add(tournament);

		return tournament;
	}

	public cancelTournament(tournament : ServerTournament)
	{
		tournaments.delete(tournament);
	}
}
