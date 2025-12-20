import { FastifyInstance } from 'fastify'
import { MatchController } from '../controllers/MatchController.js'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { HeaderMiddleware } from '../middleware/HeaderMiddleware.js'
import { MatchData } from '../types/match.types.js';
import { TournamentController } from '../controllers/TournamentController.js';

export function tournamentRoutes(
    fastify: FastifyInstance,
    controller: TournamentController,
    middleware: {
        auth: AuthMiddleware,
        header: HeaderMiddleware
    }
) {
    fastify.post<{ Body: {tournamentId: number, matchData: MatchData} }>('/update/match', {
        preHandler: middleware.header.checkGameSecret,
    }, controller.updateMatchResult.bind(controller));

}
