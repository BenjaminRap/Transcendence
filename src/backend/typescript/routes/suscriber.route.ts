import { FastifyInstance } from 'fastify';
import { SuscriberController } from '../controllers/SuscriberController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';
import { UpdateData, UpdatePassword } from '../types/suscriber.types.js';

export async function suscriberRoute(
    fastify: FastifyInstance, 
    controller: SuscriberController, 
    middleware: AuthMiddleware
) {
    fastify.get('/profile', {
        preHandler: middleware.authenticate,
    }, controller.getProfile.bind(controller));

    fastify.put<{ Body: UpdateData }>('/updateprofile', {
        preHandler: middleware.authenticate,
    }, controller.updateProfile.bind(controller));

    fastify.put<{ Body: UpdatePassword }>('/updatepassword', {
        preHandler: [
            middleware.authenticate,
            middleware.keyAuthenticate
        ]
    }, controller.updatePassword.bind(controller));
}
