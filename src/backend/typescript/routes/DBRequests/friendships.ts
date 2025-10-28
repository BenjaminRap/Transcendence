import { FastifyInstance } from 'fastify';
import { FriendsData } from '../dataStructure/commonStruct.js'
import { FriendshipRequest, PendingListResponse } from '../dataStructure/friendStruct.js'

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

export async function getPendingList(fastify: FastifyInstance, id: number) : Promise<PendingListResponse[]> {
    return await fastify.prisma.friendship.findMany({
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
}
