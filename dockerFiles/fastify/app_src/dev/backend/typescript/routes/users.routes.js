import { UsersController } from '../controllers/UsersController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
export function usersRoutes(fastify, controller, middleware) {
    fastify.get('/search/id/:id', {
        preHandler: middleware.authenticate,
    }, controller.getById.bind(controller));
    fastify.get('/search/username/:username', {
        preHandler: middleware.authenticate,
    }, controller.getByName.bind(controller));
}
