import type { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentService } from '../services/TournamentService.js';
import type { MatchData } from '../types/match.types.js';
import { MatchService } from '../services/MatchService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament } from '../types/tournament.types.js';


export class TournamentController {
    constructor(
        private tournamentService: TournamentService,
        private matchService: MatchService,
    ) {}

    private tournamentLimit = 64;

    // Create a new tournament
    async createTournament(request: FastifyRequest<{ Body: CreateTournament }>, reply: FastifyReply) {
        const data = request.body;
		// verifier qu'il n'y a pas de joueur en doublon dans les participants
		// verifier qu'il n'y a pas de duplicat d'alias dans les participants
		// verifier que les alias ne sont pas vides
		// verifier que le titre du tournois n'est ni vide ni trop long ni deja pris


		// verifie qu'il ny a pas plus de participants que la limite autorisee
        if (data.participants.length > this.tournamentLimit) {
            throw new TournamentException(TournamentError.TOURNAMENT_LIMIT_EXCEEDED);
        }

        // Additional logic to create the tournament
        try {
            const tournament = await this.tournamentService.createTournament(data);
            reply.status(201).send(tournament);
        } catch (error) {
            throw new TournamentException(TournamentError.TOURNAMENT_CREATION_FAILED);
        }
    }

    // Additional methods for managing tournaments can be added here

    // ==================================== PUBLIC ==================================== //

    // ----------------------------------------------------------------------------- //

    // ==================================== PRIVATE ==================================== //

    // ----------------------------------------------------------------------------- //
}