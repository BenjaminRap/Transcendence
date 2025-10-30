import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkAuth } from './utils/JWTmanagement.js';
import { getUserById } from './DBRequests/users.js';
import { idParamSchema } from './schemas/schemaRules.js';
import { FriendshipResponse, FriendshipRequest, PendingListResponse, FriendListResponse, sanitizeFriends } from './dataStructure/friendStruct.js';
import { createNewFriendRequest, getPendingList, getFriendRelation,  getFriendlist, updateFriendStatus, deleteRelationship } from './DBRequests/friendships.js'
import { success } from 'zod';

export async function friendship(fastify: FastifyInstance) {
    
    // /friends/request/userId -> envoie demande d'ami
    fastify.post('/request/:userId', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const fetchedId = idParamSchema.safeParse(request.params['userId']).data;
            if (!fetchedId) {
                return reply.status(400).send({
                    success: false,
                    message: 'invalid ID'
                } as FriendshipResponse);
            }

            const friendFinder = await getUserById(fastify, (request as any).user.userId);
            const friendReceiver = await getUserById(fastify, fetchedId);
            if (!friendReceiver || !friendFinder) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                } as FriendshipResponse);
            }
            if (friendFinder.id === friendReceiver.id) {
                return reply.status(409).send({
                    success: false,
                    message: 'try meditation to be friends with yourself ;)'
                } as FriendshipResponse);
            }

            const friendshipReq: FriendshipRequest = {
                requesterId: friendFinder.id ,
                receiverId: friendReceiver.id
            }
            const newFriend = await createNewFriendRequest(fastify, friendshipReq);

            if (!newFriend) {
                return reply.status(400).send({
                    success: false,
                    message: 'this relation already exist'
                });
            }
            return reply.status(201).send({
                success: true,
                message: 'Friend request sent successfully',
                friendship: sanitizeFriends(newFriend)
            } as FriendshipResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            } as FriendshipResponse);            
        }
    });

    // GET	/friends -> Liste les amis (status = ACCEPTED)
    fastify.get('/friends', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request as any).user.userId;
            const user = getUserById(fastify, userId);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            const friendList = await getFriendlist(fastify, userId);

            return reply.status(200).send({
                success: true,
                message: 'friend list retrieved successful',
                friendList
            } as FriendListResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            });            
        }
    })

    // GET	/friends/requests -> retourne la liste des amis en attente
    fastify.get('/requests', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = await getUserById(fastify, (request as any).user.userId);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                } as PendingListResponse);
            }
            const pendingList = await getPendingList(fastify, user.id);
            if (!pendingList) {
                return reply.status(200).send({
                    success: true,
                    message: 'no pending friends list'
                }  as PendingListResponse);
            }

            return reply.status(200).send({
                success: true,
                message: 'list retrieved with success',
                pendingList
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internale server error'
            });
        }
    });

    // POST	/friends/accept/:userId	Accepte une demande d’ami
    fastify.put('/accept/:userId', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const frienId = idParamSchema.safeParse(request.params['userId']).data;
            if (!frienId) {
                return reply.status(400).send({
                    sucess: false,
                    message: 'Bad userId format'
                });
            }
    
            const newFriend = await getUserById(fastify, frienId);
            const currentUser = await getUserById(fastify, (request as any).user.userId);
            if (!newFriend || !currentUser) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            const relationShip = await getFriendRelation(fastify, newFriend.id, currentUser.id);
            if (!relationShip) {
                return reply.status(404).send({
                    success: false,
                    message: 'No relationship currently exists between these users',
                });
            }

            await updateFriendStatus(fastify, relationShip.id, 'ACCEPTED')
            return reply.status(204).send({
                success: true,
                message: 'There are new friends in the world, yay!'
            });

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            } as FriendshipResponse);
        }
    });

    // POST	/friends/reject/:userId -> Refuser une demande d’ami / supprimer ami
    fastify.put('/reject/:userId', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const frienId = idParamSchema.safeParse(request.params['userId']).data;
            if (!frienId) {
                return reply.status(400).send({
                    sucess: false,
                    message: 'Bad userId format'
                });
            }
    
            const newFriend = await getUserById(fastify, frienId);
            const currentUser = await getUserById(fastify, (request as any).user.userId);
            if (!newFriend || !currentUser) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            const relationShip = await getFriendRelation(fastify, newFriend.id, currentUser.id);
            if (!relationShip) {
                return reply.status(404).send({
                    success: false,
                    message: 'No relationship currently exists between these users',
                });
            }

            await deleteRelationship(fastify, relationShip.id);
            return reply.status(204).send({
                success: true,
                message: 'delete successful'
            });

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            } as FriendshipResponse);            
        }
    });


















    
    fastify.get('/db', async (request: FastifyRequest, reply: FastifyReply) => {
        const res = await fastify.prisma.friendship.findMany() ;
        console.log(res);
    });  

    // POST /friends/block/:userId  bloquer un user
    // DELETE	/friends/delete/:friendshipId	    Supprime un ami

}
