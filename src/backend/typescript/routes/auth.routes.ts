import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/AuthController.js'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { RegisterData, LoginData, VerifData } from '../types/auth.types.js';

export function authRoutes(
    fastify: FastifyInstance,
    controller: AuthController,
    middleware: AuthMiddleware
) {
    fastify.post<{ Body: RegisterData }>('/register', controller.register.bind(controller));
 
    fastify.post<{ Body: LoginData }>('/login', controller.login.bind(controller));
 
    fastify.get('/refresh', {
        preHandler: middleware.refreshAuthenticate,
    }, controller.refresh.bind(controller));

	fastify.get('/callback', controller.callback42.bind(controller));
}
