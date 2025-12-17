import { FastifyInstance } from 'fastify'
import { MatchController } from '../controllers/MatchController.js'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'

export function matchRoutes(
    fastify: FastifyInstance,
    controller: MatchController,
    middleware: AuthMiddleware
) {
    fastify.post('/start', controller.startMatch.bind(controller));

    fastify.get('/history', {
        preHandler: middleware.authenticate,
    }, controller.getMatchHistory.bind(controller));
}
