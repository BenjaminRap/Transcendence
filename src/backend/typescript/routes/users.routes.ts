import { FastifyInstance } from 'fastify';
import { UsersController } from '../controllers/usersController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

export function usersRoutes(
    fastify: FastifyInstance,
    controller: UsersController,
    middleware: AuthMiddleware
) {
    fastify.get('/search/:id', {
        preHandler: middleware.authenticate,
    }, controller.getById.bind(controller));

    fastify.get('/search/:username', {
        preHandler: middleware.authenticate,
    }, controller.getByName.bind(controller));
}
