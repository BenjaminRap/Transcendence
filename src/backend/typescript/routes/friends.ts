import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkAuth } from './utils/JWTmanagement.js';
import { getUserById } from './DBRequests/users.js';
import { idParamSchema } from './schemas/schemaRules.js';
import { FriendshipResponse, FriendshipRequest, sanitizeFriends } from './dataStructure/friendStruct.js';
import { createNewFriendRequest } from './DBRequests/friendships.js'
import { success } from 'zod';

export async function friendship(fastify: FastifyInstance) {
    
    // /friends/request/userId -> envoie demande d'ami
    fastify.post('/request/:userId', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const fetchedId = idParamSchema.safeParse(request.params['userId']);
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

            const friendshipReq: FriendshipRequest = {
                requesterId: friendFinder.id ,
                receiverId: friendReceiver.id
            }
            console.log("ICI");
            const newFriend = await createNewFriendRequest(fastify, friendshipReq);

            console.log('New Friends : ', newFriend);

            if (!newFriend) {
                return reply.status(400).send({
                    success: false,
                    message: 'this relation already exist'
                });
            }
            return reply.status(201).send({
                success: true,
                message: 'Friend request sent successfully',
                friend: sanitizeFriends(newFriend)
            } as FriendshipResponse);
        } catch (error) {
            console.log(error);
            
        }
    });

    fastify.get('/db', async (request: FastifyRequest, reply: FastifyReply) => {
        const res = await fastify.prisma.friendship.findMany() ;
        console.log(res);
    });  

    // GET	/friends/requests	            Liste des demandes d’amis reçues (status = PENDING)
    // POST	/friends/accept/:friendshipId	Accepte une demande d’ami
    // POST	/friends/reject/:friendshipId	Refuse une demande d’ami
    // GET	/friends	                    Liste les amis (status = ACCEPTED)
    // DELETE	/friends/:friendshipId	    Supprime un ami

}
