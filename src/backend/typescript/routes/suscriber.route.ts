import { FastifyInstance } from 'fastify';
import { SuscriberController } from '../controllers/SuscriberController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
import { HeaderMiddleware } from '../middleware/HeaderMiddleware.js';
import { UpdatePassword, DeleteAccount } from '../types/suscriber.types.js';

export async function suscriberRoute(
    fastify: FastifyInstance, 
    controller: SuscriberController, 
    middleware: {
        auth: AuthMiddleware,
        header: HeaderMiddleware,
    }
) {
    fastify.get('/profile', {
        preHandler: middleware.auth.authenticate,
    }, controller.getProfile.bind(controller));
    
    fastify.put<{ Body: { username: string } }>('/update/username', {
        preHandler: middleware.auth.authenticate,
    }, controller.updateUsername.bind(controller));

    fastify.put<{ Body: UpdatePassword }>('/update/password', {
        preHandler: middleware.auth.authenticate,
    }, controller.updatePassword.bind(controller));

    fastify.put('/update/avatar', {
        preHandler: [
            middleware.header.checkFormData,
            middleware.auth.authenticate,
        ] 
    }, controller.updateAvatar.bind(controller));

    fastify.delete('/delete/avatar', {
        preHandler: [
            middleware.auth.authenticate,
            // middleware.auth.keyAuthenticate
        ]
    }, controller.deleteAvatar.bind(controller));

    fastify.delete('/delete/account', {
        preHandler: [
            middleware.auth.authenticate,
        ]
    }, controller.deleteAccount.bind(controller));

    fastify.get('getstats', {
        preHandler: middleware.auth.authenticate,
    }, controller.getStats.bind(controller));
}
