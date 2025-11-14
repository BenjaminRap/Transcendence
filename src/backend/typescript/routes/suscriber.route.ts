import { FastifyInstance } from 'fastify';
import { SuscriberController } from '../controllers/SuscriberController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
import { PreparsingMiddleware } from '../middleware/PreparsingMiddleware.js';
import { UpdateData, UpdatePassword } from '../types/suscriber.types.js';

export async function suscriberRoute(
    fastify: FastifyInstance, 
    controller: SuscriberController, 
    middleware: {
        authenticate: AuthMiddleware,
        parseBody: PreparsingMiddleware
    }
) {
    fastify.get('/profile', {
        preHandler: middleware.authenticate.authenticate,
    }, controller.getProfile.bind(controller));
    
    fastify.put<{ Body: UpdateData }>('/updateprofile', {
        preHandler: [
            middleware.authenticate.authenticate,
            // middleware.parseBody.checkBody
        ]
    }, controller.updateProfile.bind(controller));

    fastify.put<{ Body: UpdatePassword }>('/updatepassword', {
        preHandler: [
            middleware.authenticate.authenticate,
            middleware.authenticate.keyAuthenticate
        ]
    }, controller.updatePassword.bind(controller));
}
