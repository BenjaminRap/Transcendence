import { FastifyInstance } from 'fastify';
import { SuscriberController } from '../controllers/SuscriberController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
import { UpdatePassword, DeleteAccount } from '../types/suscriber.types.js';

export async function suscriberRoute(
    fastify: FastifyInstance, 
    controller: SuscriberController, 
    middleware: AuthMiddleware,
) {
    fastify.get('/profile', {
        preHandler: middleware.authenticate,
    }, controller.getProfile.bind(controller));
    
    fastify.put<{ Body: { username: string } }>('/update/username', {
        preHandler: middleware.authenticate,
    }, controller.updateUsername.bind(controller));

    fastify.put<{ Body: UpdatePassword }>('/update/password', {
        preHandler: middleware.authenticate,
    }, controller.updatePassword.bind(controller));

    fastify.put('/update/avatar', {
        preHandler: middleware.authenticate,
    }, controller.updateAvatar.bind(controller));

    fastify.delete<{ Body: DeleteAccount }>('/deleteaccount', {
        preHandler: [
            middleware.authenticate,
            middleware.keyAuthenticate
        ]
    }, controller.deleteAccount.bind(controller));

    fastify.get('getstats', {
        preHandler: middleware.authenticate,
    }, controller.getStats.bind(controller));
}
