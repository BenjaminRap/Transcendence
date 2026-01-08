import type { TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ServerMessage";
import { ServerTournament } from "./ServerTournament";
import { error, success, type Result } from "@shared/utils";
import type { DefaultServer, DefaultSocket } from "..";

const	tournamentsByName = new Map<string, ServerTournament>();
const	tournamentsById = new Map<string, ServerTournament>();

export class	TournamentMaker
{
	constructor(
		private _io : DefaultServer
	)
	{

	}

	public createTournament(settings : TournamentCreationSettings, creator : DefaultSocket) : Result<ServerTournament>
	{
		if (tournamentsByName.has(settings.name))
			return error("Tournament Name already taken !");
		const	tournament = new ServerTournament(() => this.removeTournament(tournament), settings, this._io, creator);

		this.addTournament(tournament);
		return success(tournament);
	}

	public joinTournament(tournamentId : TournamentId, socket : DefaultSocket) : Result<ServerTournament>
	{
		const	tournament = tournamentsById.get(tournamentId);

		if (tournament === undefined)
			return error("Invalid Tournament Id !");
		const	result = tournament.addParticipant(socket);
		if (!result.success)
			return result;
		return success(tournament);
	}

	private	addTournament(tournament : ServerTournament)
	{
		const	description = tournament.getDescription();

		tournamentsById.set(description.id, tournament);
		tournamentsByName.set(description.name, tournament);
	}

	private	removeTournament(tournament : ServerTournament)
	{
		const	description = tournament.getDescription();

		tournamentsById.delete(description.id);
		tournamentsByName.delete(description.name);
	}
}

export function	getPublicTournamentsDescriptions() : TournamentDescription[]
{
	const	descriptions : TournamentDescription[] = [];

	tournamentsByName.forEach(tournament => {
		const	description = tournament.getDescriptionIfAvailable();

		if (description !== null)
			descriptions.push(description);
	});
	return descriptions;
}
