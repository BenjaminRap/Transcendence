import { FastifyInstance } from 'fastify';
import { FriendsData } from '../dataStructure/commonStruct.js'
import { FriendshipRequest, PendingList } from '../dataStructure/friendStruct.js'

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
    return await fastify.prisma.friendship.create({
        data
    });
}

export async function getPendingList(fastify: FastifyInstance, id: number) : Promise<PendingList[]> {
    const pendingList =  await fastify.prisma.friendship.findMany({
        where: {
            OR: [
                { receiverId: id },
                { requesterId: id },
            ],
            status: 'PENDING',
        },
        select: {
            status: true,
            createdAt: true,
            receiver: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
            requester: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
    });

    return pendingList.map(friendship => {
        const otherUser =
            friendship.requester.id === id
            ? friendship.receiver
            : friendship.requester;

        return {
            status: friendship.status,
            createdAt: friendship.createdAt,
            user: otherUser,
            recieved: friendship.requester.id === id ? true : false
        };
    });

}

export async function getFriendRelation(fastify: FastifyInstance, userAId: number, userBId: number) {
    return fastify.prisma.Friendship.findFirst({
        where: {
            OR: [
                { receiverId: userAId, requesterId: userBId },
                { receiverId: userBId, requesterId: userAId },
            ],
        },
        select: {
            status: true,
            receiver: true,
            requester: true,
        },
    });
}

export async function updateFriendStatus(fastify: FastifyInstance, relationId: number, status: string) {
    return await fastify.prisma.Friendship.updateUnique({
        where: { relationId },
        data: status,
    });
}
