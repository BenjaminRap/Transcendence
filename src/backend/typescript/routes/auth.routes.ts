import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/authController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

export function authRoutes(
    fastify: FastifyInstance,
    controller: AuthController,
    middleware: AuthMiddleware
) {
    fastify.post('/register', controller.register.bind(controller));
    fastify.post('/login', controller.login.bind(controller));
    fastify.get('/refresh', {
        preHandler: middleware.authenticate,
    }, controller.refresh.bind(controller));
}
