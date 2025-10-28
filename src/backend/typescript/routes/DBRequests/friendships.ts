import { FastifyInstance } from 'fastify';
import { FriendsData } from '../dataStructure/commonStruct.js'
import { FriendshipRequest } from '../dataStructure/friendStruct.js'

export async function thisRelationExist(fastify: FastifyInstance, data: FriendshipRequest) : Promise<boolean> {
    const friendship = await fastify.prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: data.requesterId, receiverId: data.receiverId },
                { requesterId: data.receiverId, receiverId: data.requesterId }
            ]
        }
    })
    if (friendship)
        return true;
    return false;
}

export async function createNewFriendRequest(fastify: FastifyInstance, data: FriendshipRequest) : Promise<FriendsData | undefined> {
    if (await thisRelationExist(fastify, data))
        return undefined;
    console.log("THERE");
    return await fastify.prisma.friendship.create({
        data
    });
}
