import type { FastifyInstance } from 'fastify';
import { MatchController } from '../controllers/MatchController.js'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { HeaderMiddleware } from '../middleware/HeaderMiddleware.js'
import { MatchData } from '../types/match.types.js';

export function matchRoutes(
    fastify: FastifyInstance,
    controller: MatchController,
    middleware: {
        auth: AuthMiddleware,
        header: HeaderMiddleware
    }
) {
    fastify.post<{ Body: MatchData }>('/register', {
        preHandler: middleware.header.checkGameSecret,
    }, controller.registerMatch.bind(controller));

    fastify.get('/history', {
        preHandler: middleware.auth.authenticate,
    }, controller.getMatchHistory.bind(controller));
}
