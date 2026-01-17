import type { FastifyRequest, FastifyReply } from 'fastify';
import { FriendService } from '../services/FriendService.js'
import { FriendException, FriendError } from '../error_handlers/Friend.error.js';
import { CommonSchema } from '../schemas/common.schema.js';
import { SocketEventController } from './SocketEventController.js';

export class FriendController {
    constructor(
        private friendService: FriendService
    ) {}

    // ----------------------------------------------------------------------------- //
    // POST /friend/request/:id
    async createFriendRequest(request: FastifyRequest<{ Params: {id: string} }>, reply: FastifyReply) {
        try {
            const friendId = CommonSchema.idParam.safeParse(request.params['id']);
            if (!friendId.success) {
                throw new FriendException(FriendError.INVALID_ID, 'Invalid Id format');
            }
           
            // check users existance; their connection; create the friend request
            // returns the current user profile
            const userId = (request as any).user.userId;
            const userProfile = await this.friendService.createFriendRequest(Number(friendId.data), Number(userId));

			// notify the friend that a request has been sent
			SocketEventController.sendToUser(Number(friendId.data), 'friend-status-update', {
				requester: userProfile,
                status: 'PENDING'
			});
    
            return reply.status(201).send({
                success: true,
                message: 'Friend request successfully sent'
            });
        } catch (error) {
            if (error instanceof FriendException ) {
                switch (error.code) {
                    case FriendError.USR_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // PUT /friend/accept/:id
    async acceptFriendRequest(request: FastifyRequest<{ Params: {id: string} }>, reply: FastifyReply) {
        try {
            const userId = (request as any).user.userId;
            const friendId = CommonSchema.idParam.safeParse(request.params['id']);
            if (!friendId.success) {
                throw new FriendException(FriendError.INVALID_ID, 'Invalid Id format');
            }

            // check users existance; their connection; update the friendship status
            const userProfile = await this.friendService.acceptFriendRequest(Number(friendId.data), Number(userId));

			// notify friendship acceptance to friend
			SocketEventController.sendToUser(Number(friendId.data), 'friend-status-update', {
				friendProfile: userProfile, status: 'ACCEPTED'
			});

            return reply.status(204).send();
        } catch (error) {
            if (error instanceof FriendException ) {
                switch (error.message) {
                    case FriendError.USR_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });            
        }
    }

    // ----------------------------------------------------------------------------- //
    // DELETE /friend/delete/:id
    async deleteFriend(request: FastifyRequest<{ Params: {id: string} }>, reply: FastifyReply) {
        try {
            const userId = (request as any).user.userId;
            const friendId = CommonSchema.idParam.safeParse(request.params['id']);
            if (!friendId.success) {
                throw new FriendException(FriendError.INVALID_ID, 'Invalid Id format');
            }

            await this.friendService.deleteFriend(Number(friendId.data), Number(userId));

            return reply.status(204).send();

        } catch (error) {
            if (error instanceof FriendException ) {
                switch (error.message) {
                    case FriendError.USR_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });                        
        }
    
    }

    // ----------------------------------------------------------------------------- //
    // GET /friend/search/myfriends
    async getFriendList(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user.userId;

            const friendList = await this.friendService.getFriendsList(Number(userId));

            return reply.status(200).send({
                success: true,
                message: 'Friends list successfully found',
                friendList
            });
        } catch (error) {
            if (error instanceof FriendException ) {
                switch (error.code) {
                    case FriendError.USR_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // GET /friend/search/pendinglist
    async getPendingList(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user.userId;

            const friendList = await this.friendService.getPendingList(Number(userId));

            return reply.status(200).send({
                success: true,
                message: 'Pending list successfully found',
                friendList
            });

            
        } catch (error) {
            if (error instanceof FriendException ) {
                switch (error.code) {
                    case FriendError.USR_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });            
        }
    }
}
