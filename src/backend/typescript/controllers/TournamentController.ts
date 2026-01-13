import type { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentService } from '../services/TournamentService.js';
import type { MatchData } from '../types/match.types.js';
import { MatchService } from '../services/MatchService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';


export class TournamentController {
	constructor(
        private tournamentService: TournamentService,
		private matchService: MatchService,
	) {}

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(request: FastifyRequest<{Body: {tournamentId: number, matchData: MatchData} }>, reply: FastifyReply) {

		// le middleware checkGameSecret verifie deja le header x-game-secret
        try {
            const { tournamentId, matchData } = request.body;
			
            // does the tournament exist ?
            if (!(await this.tournamentService.validateTournament(tournamentId)))
                throw new TournamentException(TournamentError.INVALID_TOURNAMENT_ID, 'Tournament not found');
            
			// register the match
            const matchId = await this.matchService.registerTournamentMatch(matchData, tournamentId);
            
			// update the tournament with the match result
            await this.tournamentService.updateMatchResult(tournamentId, matchId);

        } catch (error) {
            if (error instanceof TournamentException)
                return reply.code(400).send({
                        success: false,
                        message: error?.message || error.code
                    })
            
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: "Internal server error",
            })
        }
        
		
		
		return;
	}
	
	// ----------------------------------------------------------------------------- //

	// ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //

}