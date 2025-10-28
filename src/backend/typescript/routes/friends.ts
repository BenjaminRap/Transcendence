import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkAuth } from './utils/JWTmanagement.js';
import { getUserById } from './DBRequests/users.js';
import { idParamSchema } from './schemas/schemaRules.js';
import { FriendshipResponse, FriendshipRequest, PendingListResponse, sanitizeFriends } from './dataStructure/friendStruct.js';
import { createNewFriendRequest, getPendingList } from './DBRequests/friendships.js'
import { success } from 'zod';

export async function friendship(fastify: FastifyInstance) {
    
    // /friends/request/userId -> envoie demande d'ami
    fastify.post('/request/:userId', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const fetchedId = idParamSchema.safeParse(request.params['userId']) ;
            if (!fetchedId.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'invalid ID'
                } as FriendshipResponse);
            }

            const friendFinder = await getUserById(fastify, (request as any).user.userId);
            const friendReceiver = await getUserById(fastify, fetchedId.data);
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

            console.log(pendingList);
            // return reply.status(200).send({
            //     success: true,
            //     message: 'list retrieved successfull',
            //     pendingList: 
            // }  as PendingListResponse);

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internale server error'
            });
        }
    });




    fastify.get('/db', async (request: FastifyRequest, reply: FastifyReply) => {
        const res = await fastify.prisma.friendship.findMany() ;
        console.log(res);
    });  

    // POST	/friends/accept/:friendshipId	Accepte une demande d’ami
    // POST	/friends/reject/:friendshipId	Refuse une demande d’ami
    // GET	/friends	                    Liste les amis (status = ACCEPTED)
    // DELETE	/friends/:friendshipId	    Supprime un ami

}
