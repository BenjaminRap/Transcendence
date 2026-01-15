import type { FastifyInstance } from 'fastify';
import { MatchController } from '../controllers/MatchController.js'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { HeaderMiddleware } from '../middleware/HeaderMiddleware.js'
import type { MatchData } from '../types/match.types.js';

export function matchRoutes(
    fastify: FastifyInstance,
    controller: MatchController,
    middleware: {
        auth: AuthMiddleware,
    }
) {
    fastify.get('/history', {
        preHandler: middleware.auth.authenticate,
    }, controller.getMatchHistory.bind(controller));
}
