import { PrismaClient, Friendship, FriendshipStatus } from "@prisma/client"
import { FriendException } from "../error_handlers/Friend.error.js";
import { ListFormat } from '../types/friend.types.js'

export enum FriendError {
    USR_NOT_FOUND = 'User not found',
    INVALID_ID = 'Invalid Id',
    ACCEPTED = 'Already friends',
    PENDING = 'Friendship in pending mod',
    NO_LINK = 'No relationship'
}

export class FriendService {
    constructor(
        private prisma: PrismaClient
    ) {}

    // ----------------------------------------------------------------------------- //
    async createFriendRequest(friendId: number, userId: number) {
        if (friendId == userId)
            throw new FriendException(FriendError.INVALID_ID, 'Impossible to create this bond of friendship')

        // check users account validity
        if ( !this.checkId(friendId) || !this.checkId(userId) )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        // throw an error if a link exist between users
        const friendship = await this.getExistingLink(friendId, userId);
        if (friendship) {
            if (friendship.status === 'ACCEPTED')
                throw new FriendException(FriendError.ACCEPTED, FriendError.ACCEPTED);
            else
                throw new FriendException(FriendError.PENDING, FriendError.PENDING);
        }


        await this.prisma.friendship.create({ requesterId: userId, receiverId: friendId });        
    }

    // ----------------------------------------------------------------------------- //
    async acceptFriendRequest(friendId: number, userId: number) {
        if (friendId == userId)
            throw new FriendException(FriendError.INVALID_ID, FriendError.INVALID_ID);

        // check users account validity
        if ( !this.checkId(friendId) || !this.checkId(userId) )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        // check existing link
        const friendship = await this.getExistingLink(friendId, userId);
        if (!friendship)
            throw new FriendException(FriendError.NO_LINK, FriendError.NO_LINK);
        if (friendship.status === FriendshipStatus.ACCEPTED)
            throw new FriendException(FriendError.ACCEPTED, FriendError.ACCEPTED);

        await this.prisma.Friendship.update({
            where: { id: friendship.id },
            data: { status: FriendshipStatus.ACCEPTED }
        });
    }

    // ----------------------------------------------------------------------------- //
    async deleteFriend(friendId: number, userId: number) {
         if (friendId == userId)
            throw new FriendException(FriendError.INVALID_ID, FriendError.INVALID_ID);

        // check users account validity
        if ( !this.checkId(friendId) || !this.checkId(userId) )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        // check existing link
        const friendship = await this.getExistingLink(friendId, userId);
        if (!friendship)
            throw new FriendException(FriendError.NO_LINK, FriendError.NO_LINK);

        await this.prisma.Friendship.delete({ 
            where: { id: friendship.id }
        });

    }

    // ----------------------------------------------------------------------------- //
    async getFriendsList(userId: number): Promise<ListFormat> {
        // check users account validity
        if ( !this.checkId(userId) )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);
        
        // extract friend list from the DB
        const friendList = await this.prisma.Friendship.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { requesterId: userId },
                ],
                status: FriendshipStatus.ACCEPTED,
            },
            select: {
                status: true,
                updatedAt: true,
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

        // returns the formated friend list
        return (await this.formatList(friendList, userId) as ListFormat);
    }

    // ----------------------------------------------------------------------------- //
    async getPendingList(userId: number): Promise<ListFormat> {
        // check users account validity
        if ( !this.checkId(userId) )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        const pendingList =  await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { requesterId: userId },
                ],
                status: FriendshipStatus.PENDING,
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

        return (await this.formatList(pendingList, userId) as ListFormat);
    }

    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async checkId(id: number): Promise<boolean> {
        if (await this.prisma.findFirst({where: { id }, select: { id: true }}))
            return true;
        return false;
    }

    // ----------------------------------------------------------------------------- //
    private async getExistingLink(friendId: number, userId: number): Promise<Friendship> {
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: friendId, receiverId: userId },
                    { requesterId: userId, receiverId: friendId }
                ]
            }
        })
        return friendship as Friendship;
    }

    // ----------------------------------------------------------------------------- //
    private async formatList(list: Friendship[], userId: number): Promise<any> {
        return list.map(friendship => {
            const otherUser = friendship.requester.id === userId
                            ? friendship.receiver
                            : friendship.requester;
            return {
                status: friendship.status,
                updatedAt: friendship.updatedAt,
                user: otherUser,
            };
        });
    }
}