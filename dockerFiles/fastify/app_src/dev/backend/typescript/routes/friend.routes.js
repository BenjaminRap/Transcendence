import { AuthMiddleware } from '../middleware/AuthMiddleware.js';
import { FriendController } from '../controllers/FriendController.js';
export function friendRoute(fastify, controller, middleware) {
    fastify.post('/request/:id', {
        preHandler: middleware.authenticate
    }, controller.createFriendRequest.bind(controller));
    fastify.put('/accept/:id', {
        preHandler: middleware.authenticate
    }, controller.acceptFriendRequest.bind(controller));
    fastify.delete('/delete/:id', {
        preHandler: middleware.authenticate
    }, controller.deleteFriend.bind(controller));
    fastify.get('/search/myfriends', {
        preHandler: middleware.authenticate
    }, controller.getFriendList.bind(controller));
    fastify.get('/search/pendinglist', {
        preHandler: middleware.authenticate
    }, controller.getPendingList.bind(controller));
}
