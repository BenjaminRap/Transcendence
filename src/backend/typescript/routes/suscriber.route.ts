import { FastifyInstance } from 'fastify';
import { SuscriberController } from '../controllers/suscriberController';
import { AuthMiddleware } from '../middleware/authMiddleware';

export async function suscriberRoute(
    fastify: FastifyInstance, 
    controller: SuscriberController, 
    middleware: AuthMiddleware
) {
    fastify.get('/profile', {
        preHandler: middleware.authenticate,
    }, controller.getProfile.bind(controller));

    fastify.get('/update', {
        preHandler: middleware.authenticate,
    }, controller.updateProfile.bind(controller));
}
