import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkAuth } from './utils/JWTmanagement.js';
import { getUserById } from './DBRequests/users.js';
import { idParamSchema } from './schemas/schemaRules.js';
import { FriendshipResponse, FriendshipRequest, PendingListResponse, sanitizeFriends } from './dataStructure/friendStruct.js';
import { createNewFriendRequest, getPendingList, getFriendRelation, updateFriendStatus } from './DBRequests/friendships.js'
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
                    message: 'try meditation to be friends with yourself :)'
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
    fastify.put('/accept/:userId', { preHandler: checkAuth}, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const frienId = idParamSchema.safeParse(request.params['userId']).data;
            if (!frienId) {
                return reply.status(400).send({
                    sucess: false,
                    message: 'Bad userId format'
                });
            }
    
            const newFriend = await getUserById(fastify, frienId);
            if (!newFriend) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            const relationId = await getFriendRelation(fastify, newFriend.id, (request as any).userId);
            if (!relationId) {
                return reply.status(404).send({
                    success: false,
                    message: 'No relationship currently exists between these users',
                });
            }

            await updateFriendStatus(fastify, relationId.data, 'ACCEPTED')
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
    })

    fastify.get('/db', async (request: FastifyRequest, reply: FastifyReply) => {
        const res = await fastify.prisma.friendship.findMany() ;
        console.log(res);
    });  

    // POST	/friends/reject/:userId Refuse une demande d’ami
    // POST /friends/block/:userId  bloquer un user
    // GET	/friends	                    Liste les amis (status = ACCEPTED)
    // DELETE	/friends/:friendshipId	    Supprime un ami

}
