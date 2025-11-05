import { FastifyInstance } from 'fastify'
import { AuthMiddleware } from '../middleware/authMiddleware'
import { FriendController } from '../controllers/friendController'

export function friendRoute(
    fastify: FastifyInstance,
    controller: FriendController,
    middleware: AuthMiddleware
) {
    fastify.post('/request/:id', { 
        preHandler: middleware.authenticate
    }, controller.createFriendRequest.bind(controller));

    fastify.put('/accept/:id', {
        preHandler: middleware.authenticate
    }, controller.acceptFriendRequest.bind(controller));

    fastify.put('/delete/:id', {
        preHandler: middleware.authenticate
    }, controller.deleteFriend.bind(controller));

    fastify.get('/myfriends', {
        preHandler: middleware.authenticate
    }, controller.getFriendList.bind(controller));

    fastify.get('/pending', {
        preHandler: middleware.authenticate
    }, controller.getPendingList.bind(controller));
}
