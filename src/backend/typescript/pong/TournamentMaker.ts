import type { TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ServerMessage";
import { ServerTournament } from "./ServerTournament";
import { error, success, type Result } from "@shared/utils";
import type { ServerType } from "..";
import type { DefaultSocket } from "../controllers/SocketEventController";

const	tournamentsByName = new Map<string, ServerTournament>();
const	tournamentsById = new Map<string, ServerTournament>();

export class	TournamentMaker
{
	constructor(
		private _io : ServerType
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

	public async joinTournament(tournamentId : TournamentId, socket : DefaultSocket) : Promise<Result<ServerTournament>>
	{
		const	tournament = tournamentsById.get(tournamentId);

		if (tournament === undefined)
			return error("Invalid Tournament Id !");
		const	result = await tournament.addParticipant(socket);
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

export async function	getPublicTournamentsDescriptions(socket : DefaultSocket) : Promise<TournamentDescription[]>
{
	const	descriptions : TournamentDescription[] = [];

	for (const tournament of tournamentsByName.values())
	{
		const	description = await tournament.getDescriptionIfAvailable(socket);

		if (description !== null)
			descriptions.push(description);
	}
	return descriptions;
}
