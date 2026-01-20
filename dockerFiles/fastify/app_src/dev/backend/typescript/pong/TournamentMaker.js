import { ServerTournament } from "./ServerTournament.js";
import { error, success } from "../../../shared/utils.js";
const tournamentsByName = new Map();
const tournamentsById = new Map();
export class TournamentMaker {
    constructor(_io) {
        this._io = _io;
    }
    createTournament(settings, creator) {
        if (tournamentsByName.has(settings.name))
            return error("Tournament Name already taken !");
        const tournament = new ServerTournament(() => this.removeTournament(tournament), settings, this._io, creator);
        this.addTournament(tournament);
        return success(tournament);
    }
    joinTournament(tournamentId, socket) {
        const tournament = tournamentsById.get(tournamentId);
        if (tournament === undefined)
            return error("Invalid Tournament Id !");
        const result = tournament.addParticipant(socket);
        if (!result.success)
            return result;
        return success(tournament);
    }
    addTournament(tournament) {
        const description = tournament.getDescription();
        tournamentsById.set(description.id, tournament);
        tournamentsByName.set(description.name, tournament);
    }
    removeTournament(tournament) {
        const description = tournament.getDescription();
        tournamentsById.delete(description.id);
        tournamentsByName.delete(description.name);
    }
}
export function getPublicTournamentsDescriptions(socket) {
    const descriptions = [];
    tournamentsByName.forEach(tournament => {
        const description = tournament.getDescriptionIfAvailable(socket);
        if (description !== null)
            descriptions.push(description);
    });
    return descriptions;
}
