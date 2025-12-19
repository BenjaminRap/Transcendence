import type { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentService } from '../services/TournamentService.js';
import type { MatchData } from '../types/match.types';
import { MatchService } from '../services/MatchService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import { success } from 'zod';


export class TournamentController {
	constructor(
        private tournamentService: TournamentService,
		private matchService: MatchService,
		// private tournamentService: TournamentService,
	) {}

    private expectedGameSecret = process.env.GAME_BACKEND_SECRET || '';

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(request: FastifyRequest<{Body: {tournamentId: number, matchData: MatchData} }>, reply: FastifyReply) {

        try {
            const gameSecret = request.headers['x-game-secret'];
            if (gameSecret !== this.expectedGameSecret) {
                return reply.code(403).send({
                    success: false,
                    message: 'Forbidden'
                });
            }

            const { tournamentId, matchData } = request.body;
            // voir si le tournois existe
            if (!(await this.validateTournament(tournamentId)))
                throw new TournamentException(TournamentError.INVALID_TOURNAMENT_ID, 'Tournament not found');
            // enregisterle match
            const matchId = await this.matchService.registerTournamentMatch(matchData, tournamentId);
            // mettre a jour le match dans le tournois
            await this.tournamentService.updateMatchResult(tournamentId, matchId);

        } catch (error) {
            if (error instanceof TournamentException)
                return reply.code(400).send({
                        success: false,
                        message: error?.message || 'An error occurred during the registration of the match.'
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
	async validateTournament(tournamentId: number): Promise<boolean> {
		// verifier si le tournoi est valide
		const tournemant = await
		return true;
	}

}