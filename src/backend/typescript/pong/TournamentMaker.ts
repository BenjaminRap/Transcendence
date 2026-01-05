import type { TournamentCreationSettings, TournamentDescription } from "@shared/ServerMessage";
import { ServerTournament } from "./ServerTournament";

const	tournaments = new Set<ServerTournament>();

export class	TournamentMaker
{
	constructor()
	{

	}

	public createTournament(settings : TournamentCreationSettings) : ServerTournament | string
	{
		const	tournament = new ServerTournament(() => tournaments.delete(tournament), settings);

		tournaments.add(tournament);

		return tournament;
	}
}

export function	getPublicTournamentsDescriptions() : TournamentDescription[]
{
	const	descriptions : TournamentDescription[] = [];

	tournaments.forEach(tournament => {
		const	description = tournament.getDescriptionIfPublic();

		if (description !== null)
			descriptions.push(description);
	});
	return descriptions;
}
