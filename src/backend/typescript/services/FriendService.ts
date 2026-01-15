import { PrismaClient, type Friendship, type User } from "@prisma/client"
import { FriendException, FriendError } from "../error_handlers/Friend.error.js";
import type { ListFormat } from '../types/friend.types.js';
import { SocketEventController } from "../controllers/SocketEventController.js";
import type { FriendProfile } from "../types/friend.types.js";

export class FriendService {
    constructor(
        private prisma: PrismaClient
    ) {}

    // ----------------------------------------------------------------------------- //
    async createFriendRequest(friendId: number, userId: number): Promise<FriendProfile> {
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
        
        const user = await this.getById(userId);
        user.isOnline = SocketEventController.isUserOnline(userId);
        
        return user;
    }

    // ----------------------------------------------------------------------------- //
    async acceptFriendRequest(friendId: number, userId: number): Promise<FriendProfile> {
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

        // if the requester try to accept the friend request
        if (friendship.receiverId !== userId)
            throw new FriendException(FriendError.INVALID_ID, "the user can't accept this friend request");

        await this.prisma.friendship.update({
            where: { id: friendship.id },
            data: { status: 'ACCEPTED' }
        });

        const user = await this.getById(userId);
        user.isOnline = SocketEventController.isUserOnline(userId);
        
        return user;
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
            return [];

        // returns the formated friend list
        return (await this.formatList(friendList, userId) as ListFormat[]);
    }

    // ----------------------------------------------------------------------------- //
    async getFriendsIds(userId: number): Promise<number[]> {
        // check user account validity
        if ( await this.checkId(userId) == false )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        const friendships = await this.prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            },
            select: {
                requesterId: true,
                receiverId: true
            }
        });

        // Filter and map to get only the friend's ID
        const friendIds = friendships.map(f => 
            f.requesterId === userId ? f.receiverId : f.requesterId
        );

        return friendIds;
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
            return [];

        return (await this.formatList(pendingList, userId) as ListFormat[]);
    }

    // ----------------------------------------------------------------------------- //
    async isFriend(friendId: number, userId: number): Promise<boolean> {
        if ( await this.checkId(friendId) == false || await this.checkId(userId) == false )
            throw new FriendException(FriendError.USR_NOT_FOUND, FriendError.USR_NOT_FOUND);

        const friendship = await this.getExistingLink(friendId, userId);
        if (friendship && friendship.status === 'ACCEPTED')
            return true;
        return false;
    }
	
	// ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async getById(id: number): Promise<FriendProfile> {
        return await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                avatar: true,
            }
        }) as FriendProfile;
    }

    // ----------------------------------------------------------------------------- //
    private async checkId(id: number): Promise<boolean> {
        if (await this.prisma.user.findFirst({where: { id }, select: { id: true }}))
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
    private async formatList(list: any[], userId: number): Promise<ListFormat[]> {
        return await Promise.all(
            list.map(async (friendship) => {
                const friend = friendship.requesterId === userId
                    ? friendship.receiver
                    : friendship.requester;

                return {
                    status: friendship.status,
                    updatedAt: friendship.updatedAt.toISOString(),
                    user: {
                        id: Number(friend.id),
                        username: friend.username,
                        avatar: friend.avatar,
                        isOnline: SocketEventController.isUserOnline(friend.id),
                    }
                } as ListFormat;
            })
        );
    }
}
