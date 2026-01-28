import type { FastifyInstance } from 'fastify';
import { UsersController } from '../controllers/UsersController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';

export function usersRoutes(
    fastify: FastifyInstance,
    controller: UsersController,
    middleware: AuthMiddleware
) {
    fastify.get<{ Params: {id: string} }>('/search/id/:id', {
        preHandler: middleware.authenticate,
    }, controller.getById.bind(controller));

    fastify.get<{ Params: {username: string} }>('/search/username/:username', {
        preHandler: middleware.authenticate,
    }, controller.getByName.bind(controller));

    fastify.get<{ Params: {id: number} }>('/id/:id/allmatches', {
        preHandler: middleware.authenticate,
    }, controller.getAllMatches.bind(controller));
}
