import { PrismaClient } from "@prisma/client";
import type { PublicProfile } from "../types/users.types.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";
import { FriendService } from "./FriendService.js";
import { SocketEventController } from "../controllers/SocketEventController.js";
import { MatchService } from "./MatchService.js";

export class UsersService {
    constructor(
        private prisma: PrismaClient,
        private friendService: FriendService,
        private matchService: MatchService,
    ) {}

    // ----------------------------------------------------------------------------- //
    async getById(id: number, userId: number): Promise<PublicProfile> {
        if ( !await this.checkIfUserExists(userId) ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No suscriber found');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            select: { id: true, avatar: true, username: true },
        });

        if (!user)
            throw new UsersException(UsersError.USER_NOT_FOUND, 'User not found');

        return {
            id: user.id,
            avatar: user.avatar,
            username: user.username,
            stats: await this.matchService.getStat(user.id),
            lastMatchs: await this.matchService.getLastMatches(user.id, 4),
            isFriend: await this.friendService.areFriends(user.id, userId),
            isOnline: SocketEventController.isUserOnline(user.id),
        }
    }

    // ----------------------------------------------------------------------------- //
    async getByName(username: string, userId: number): Promise<PublicProfile[]>
    {
        if ( !await this.checkIfUserExists(userId) ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No suscriber found');
        }

        const users = await this.prisma.user.findMany({
            where: { username: { contains: username } },
            select: { id: true, avatar: true, username: true },
            take: 10
        });

        if (!users || users.length === 0)
            throw new UsersException(UsersError.USER_NOT_FOUND, 'User not found');

        return await Promise.all(users.map(async (user) => {
            return {
                id: user.id,
                avatar: user.avatar,
                username: user.username,
                stats: await this.matchService.getStat(user.id),
                lastMatchs: await this.matchService.getLastMatches(user.id, 4),
                isFriend: await this.friendService.areFriends(user.id, userId),
                isOnline: SocketEventController.isUserOnline(user.id),
            };
        }));
    }

    // --------------------------------------------------------------------------------- //
    async checkIfUserExists(id: number): Promise<boolean> {
        const res = await this.prisma.user.count({
            where: { id: Number(id) }
        });

        return res > 0;
    }
}