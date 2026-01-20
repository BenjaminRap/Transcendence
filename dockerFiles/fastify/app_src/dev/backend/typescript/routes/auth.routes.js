import { AuthController } from '../controllers/AuthController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
export function authRoutes(fastify, controller, middleware) {
    fastify.post('/register', controller.register.bind(controller));
    fastify.post('/login', controller.login.bind(controller));
    fastify.get('/callback', controller.callback42.bind(controller));
    fastify.get('/refresh', {
        preHandler: middleware.refreshAuthenticate,
    }, controller.refresh.bind(controller));
    fastify.post('/logout', {
        preHandler: middleware.authenticate,
    }, controller.logout.bind(controller));
}
