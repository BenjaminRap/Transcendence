import { SuscriberController } from '../controllers/SuscriberController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
import { HeaderMiddleware } from '../middleware/HeaderMiddleware.js';
export async function suscriberRoute(fastify, controller, middleware) {
    fastify.get('/profile', {
        preHandler: middleware.auth.authenticate,
    }, controller.getProfile.bind(controller));
    fastify.put('/update/username', {
        preHandler: middleware.auth.authenticate,
    }, controller.updateUsername.bind(controller));
    fastify.put('/update/password', {
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
        ]
    }, controller.deleteAvatar.bind(controller));
    fastify.delete('/delete/account', {
        preHandler: [
            middleware.auth.authenticate,
        ]
    }, controller.deleteAccount.bind(controller));
}
