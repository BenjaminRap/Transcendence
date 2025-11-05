import { FastifyRequest, FastifyReply } from 'fastify'
import { FriendError, FriendService } from '../services/friendService.js'
import { FriendException } from '../error_handlers/Friend.error.js';

import { idParamSchema } from '../routes/schemas/schemaRules.js';

export class FriendController {
    constructor(
        private friendService: FriendService
    ) {}

    // ----------------------------------------------------------------------------- //
    // /friend/request/:id
    async createFriendRequest(request: FastifyRequest, reply: FastifyReply) {
        try {
            // returns parsed ids or throw error
            const friendId = this.parseId(request.params['id']);
            const userId = (request as any).user.userId;

            // check the data and link existance and create the friend request
            await this.friendService.createFriendRequest(Number(friendId), Number(userId));
    
            return reply.status(201).send({
                success: true,
                message: 'Friend request successfully sent'
            });
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
    // /friend/accept/:id
    async acceptFriendRequest(request: FastifyRequest, reply: FastifyReply) {
        try {
            // returns parsed ids or throw error
            const friendId = this.parseId(request.params['id']);
            const userId = (request as any).user.userId;

            await this.friendService.acceptFriendRequest(friendId, userId);
            
            return reply.status(204).send({
                success: true,
                message: 'Request accepted'
            });
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
    // /friend/delete/:id
    async deleteFriend(request: FastifyRequest, reply: FastifyReply) {
        try {
            // returns parsed ids or throw error
            const friendId = this.parseId(request.params['id']);
            const userId = (request as any).user.userId;

            await this.friendService.deleteFriend(friendId, userId);
            
            return reply.status(204).send({
                success: true,
                message: 'Deleted friend'
            });

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
    // /friend/myfriends
    async getFriendList(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user.userId;

            const friendList = await this.friendService.getFriendsList(userId);

            return reply.status(200).send({
                success: true,
                message: 'Friends list successfully found',
                friendList
            });
        } catch (error) {
            if (error instanceof FriendException )
                return reply.status(404).send({ success: false, message: error.message });

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // /friend/pending
    async getPendingList(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user.userId;

            const friendList = await this.friendService.getPendingList(userId);

            return reply.status(200).send({
                success: true,
                message: 'Pending list successfully found',
                friendList
            });

            
        } catch (error) {
            if (error instanceof FriendException )
                return reply.status(404).send({ success: false, message: error.message });

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });            
        }
    }


    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private parseId(id: string) {
        const fetchedId = idParamSchema.safeParse(id).data;
        if (!fetchedId)
            throw new FriendException(FriendError.INVALID_ID, FriendError.INVALID_ID);
        
        return fetchedId;
    }
}