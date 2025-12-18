import { PrismaClient, type Friendship, type User } from "@prisma/client"
import { FriendException, FriendError } from "../error_handlers/Friend.error.js";
import type { ListFormat } from '../types/friend.types.js';

export class FriendService {
    constructor(
        private prisma: PrismaClient
    ) {}

    // ----------------------------------------------------------------------------- //
    async createFriendRequest(friendId: number, userId: number) {
        if (friendId == userId)
            throw new FriendException(FriendError.INVALID_ID, 'Impossible to create this bond of friendship')
		
        if ( await this.checkId(friendId) == false || await this.checkId(userId) == false ) {
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);
		}

        // throw an error if a link exist between users
        const friendship = await this.getExistingLink(Number(friendId), Number(userId));
        if (friendship) {
            if (friendship.status === 'ACCEPTED')
                throw new FriendException(FriendError.ACCEPTED, FriendError.ACCEPTED);
            else
                throw new FriendException(FriendError.PENDING, FriendError.PENDING);
        }

        await this.prisma.friendship.create({ data: {requesterId: Number(userId), receiverId: Number(friendId)} });        
    }

    // ----------------------------------------------------------------------------- //
    async acceptFriendRequest(friendId: number, userId: number) {
        if (friendId == userId)
            throw new FriendException(FriendError.INVALID_ID, "the user can't accept its own friend request");

        // check users account validity
        if ( await this.checkId(friendId) == false || await this.checkId(userId) == false )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        // check existing link
        const friendship = await this.getExistingLink(friendId, userId);
        if (!friendship)
            throw new FriendException(FriendError.NO_LINK, FriendError.NO_LINK);
        if (friendship.status === 'ACCEPTED')
            throw new FriendException(FriendError.ACCEPTED, FriendError.ACCEPTED);

        await this.prisma.friendship.update({
            where: { id: friendship.id },
            data: { status: 'ACCEPTED' }
        });
    }

    // ----------------------------------------------------------------------------- //
    async deleteFriend(friendId: number, userId: number) {
         if (friendId == userId)
            throw new FriendException(FriendError.INVALID_ID, FriendError.INVALID_ID);

        // check users account validity
        if ( await this.checkId(friendId) == false || await this.checkId(userId) == false )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        // check existing link
        const friendship = await this.getExistingLink(friendId, userId);
        if (!friendship)
            throw new FriendException(FriendError.NO_LINK, FriendError.NO_LINK);

        await this.prisma.friendship.delete({ 
            where: { id: friendship.id }
        });

    }

    // ----------------------------------------------------------------------------- //
    async getFriendsList(userId: number): Promise<ListFormat[]> {
        // check user account validity
        if ( await this.checkId(userId) == false )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);
        
        // extract friend list from the DB
        const friendList = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { requesterId: userId },
                ],
                status: 'ACCEPTED',
            },
            include: {
                requester: true,
                receiver: true,
            },
        });

        if (friendList.length === 0)
            throw new FriendException(FriendError.USR_NOT_FOUND, "No friends found");

        // returns the formated friend list
        return (await this.formatList(friendList, userId) as ListFormat[]);
    }

    // ----------------------------------------------------------------------------- //
    async getPendingList(userId: number): Promise<ListFormat[]> {
        // check user account validity
        if ( await this.checkId(userId) == false )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        const pendingList =  await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { requesterId: userId },
                ],
                status: 'PENDING',
            },
            include: {
                requester: true,
                receiver: true,
            },
        });

        if (pendingList.length === 0)
            throw new FriendException(FriendError.USR_NOT_FOUND, "No pending friends found");

        return (await this.formatList(pendingList, userId) as ListFormat[]);
    }

    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async checkId(id: number): Promise<boolean> {
        if (await this.prisma.user.findFirst({where: { id }, select: { id: true }}))
            return true;
        return false;
    }

    // ----------------------------------------------------------------------------- //
    private async getById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { id } });
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
    private async formatList(list: Friendship[], userId: number): Promise<ListFormat[]> {
        return await Promise.all(
            list.map(async (friendship) => {
                const friendId = friendship.requesterId === userId
                    ? friendship.receiverId
                    : friendship.requesterId;

                const otherUser = await this.getById(friendId);
                if (!otherUser)
                    throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

                return {
                    status: friendship.status,
                    updatedAt: friendship.updatedAt.toISOString(),
                    user: {
                        id: otherUser.id.toString(),
                        username: otherUser.username,
                        avatar: otherUser.avatar
                    }
                } as ListFormat;
            })
        );
    }
}
