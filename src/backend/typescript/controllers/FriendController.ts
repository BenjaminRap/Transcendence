import type { FastifyRequest, FastifyReply } from 'fastify';
import { FriendService } from '../services/FriendService.js'
import { FriendException, FriendError } from '../error_handlers/Friend.error.js';
import { CommonSchema } from '@shared/common.schema';
import { SocketEventController } from './SocketEventController.js';
import { ErrorWrapper } from '../error_handlers/ErrorWrapper.js';

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
            // console.log('Creating friend request to id:', friendId.data);
            // check users existance; their connection; create the friend request and returns the current user profile
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
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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
            console.log('user {', userId, '} accepting friend request for user id:', friendId.data);

            // check users existance; their connection; update the friendship status
            const userProfile = await this.friendService.acceptFriendRequest(Number(friendId.data), Number(userId));
            // console.log('friendProfile: ', userProfile);

			// notify friendship acceptation
			SocketEventController.sendToUser(Number(friendId.data), 'friend-status-update', {
				friendProfile: userProfile, status: 'ACCEPTED'
			});

            return reply.status(204).send();
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });        
        }
    }
}
