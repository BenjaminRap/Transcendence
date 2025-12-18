import { FastifyInstance } from 'fastify'
import { MatchController } from '../controllers/MatchController.js'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { MatchData } from '../types/match.types.js';

export function matchRoutes(
    fastify: FastifyInstance,
    controller: MatchController,
    middleware: AuthMiddleware
) {
    fastify.post<{ Body: MatchData }>('/register', controller.registerMatch.bind(controller));

    fastify.get('/history', {
        preHandler: middleware.authenticate,
    }, controller.getMatchHistory.bind(controller));
}
