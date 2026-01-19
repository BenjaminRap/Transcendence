import { PrismaClient, type User, type Friendship, type Match  } from "@prisma/client";
import { type UpdateData } from "../types/suscriber.types.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import { FileService } from "./FileService.js";
import { sanitizeUser } from '../types/auth.types.js'
import type { SuscriberProfile } from "../types/suscriber.types.js";
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import path from "path";
import { SocketEventController } from "../controllers/SocketEventController.js";
import type { Friend } from "../types/suscriber.types.js";
import type { MatchService } from "./MatchService.js";
import type { GameStats, SanitizedUser } from "@shared/ServerMessage.js";

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
        private fileService: FileService,
        private matchService: MatchService,
    ) {}
    private api_url = process.env.API_URL || 'https://localhost:8080/api';
    private default_avatar_filename = 'avatarDefault.webp';
    private default_avatar_url = this.api_url + '/static/public/' + this.default_avatar_filename;
    // ----------------------------------------------------------------------------- //
    async getProfile(id: number): Promise<SuscriberProfile> {
        // we are limited to 10 matches won and 10 matches lost to get last matches
        const takeLimit = 10; 

        // we count matches won and lost for stats calculation
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: { matchesWons: true, matchesLoses: true }
                },
                matchesWons: { 
                    include: { loser: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit
                },
                matchesLoses: { 
                    include: { winner: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit
                },
                sentRequests: { include: { receiver: true } }, 
                receivedRequests: { include: { requester: true } }, 
            },
        });

        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

		const stats: GameStats = this.matchService.calculateStats(user._count.matchesWons, user._count.matchesLoses);

		// Get last 4 matches
        const allMatches = await this.matchService.getLastMatches(user.id, user.matchesWons, user.matchesLoses, 4);
        
		// Sorted 4 friends
        const sortedFriends = this.getSortedFriendlist(user.sentRequests, user.receivedRequests, 4, user.id);

        return {
            id: user.id,
            avatar: user.avatar,
            username: user.username,
            gameStats: stats,
            lastMatchs: allMatches,
            friends: sortedFriends,
        };
    }
    
	// ----------------------------------------------------------------------------- //
    async updatePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        if (!await this.passwordHasher.verify(currentPassword, user.password)) {
            throw new SuscriberException(SuscriberError.INVALID_CREDENTIALS, SuscriberError.INVALID_CREDENTIALS);
        }

        if (await this.passwordHasher.verify(newPassword, user.password)) {
            throw new SuscriberException(SuscriberError.PASSWD_ERROR, SuscriberError.PASSWD_ERROR);
        }

        const hashedPassword = await this.passwordHasher.hash(newPassword);

        await this.prisma.user.update({
            where: { id: Number(id) },
            data: {
                password: hashedPassword
            }
        });
    }

    // ----------------------------------------------------------------------------- //
    async updateUsername(id: number, data: UpdateData): Promise<User> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        // throw SuscriberException if data match
		if (this.hasChanged(user, data) === false)
			throw new SuscriberException(SuscriberError.USRNAME_ERROR, SuscriberError.USRNAME_ERROR);

        // check username availability
        const existingUser = await this.prisma.user.findUnique({
            where: { username: data.username }
        });
        if (existingUser) {
            throw new SuscriberException(SuscriberError.USRNAME_ALREADY_USED,SuscriberError.USRNAME_ALREADY_USED);
        }

        // update user in DB
        const updatedUser = await this.prisma.user.update({
            where: { id: Number(id) },
            data: {
                username: data.username ?? user.username,
            },
        });

        return updatedUser;
    }

    // ----------------------------------------------------------------------------- //
    async updateAvatar(buffer: Buffer, userId: number): Promise<SanitizedUser> {
        const user = await this.getById(userId);
        if (!user)
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);

       // upload avatar, never throw but return empty string if an error occured
        const avatarFileName = await this.fileService.uploadAvatarSafe(buffer, String(userId));
        if (!avatarFileName)
            throw new SuscriberException(SuscriberError.UPLOAD_ERROR, SuscriberError.UPLOAD_ERROR);
        
        const oldAvatarUrl = user.avatar;
        const newAvatarUrl = `${this.api_url}/static/avatars/${path.basename(avatarFileName)}`;
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { avatar: newAvatarUrl },
            });
            
            if (!oldAvatarUrl.includes(this.default_avatar_filename)) {
                await this.fileService.deleteAvatar(oldAvatarUrl);
            }
            return sanitizeUser(updatedUser);

        } catch (error) {
            console.error('Error updating avatar: ', error);
            
            await this.fileService.deleteAvatar(newAvatarUrl);

            throw new SuscriberException(SuscriberError.UPLOAD_ERROR, 'Error updating avatar');
        }
    }

    // ----------------------------------------------------------------------------- //
    async deleteAvatar(userId: number): Promise<SanitizedUser> {
        const user = await this.getById(userId);
        if (!user)
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);

        const oldAvatarUrl = user.avatar;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: this.default_avatar_url },
        });

        if (!oldAvatarUrl.includes(this.default_avatar_filename)) {
            await this.fileService.deleteAvatar(oldAvatarUrl);
        }

        return sanitizeUser(updatedUser);
    }

    // ----------------------------------------------------------------------------- //
    async deleteAccount(id: number): Promise<void> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        await this.prisma.user.delete({
            where: { id: Number(id) }
        });
    }

    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async getById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { id } });
    }

    // ----------------------------------------------------------------------------- //
    private hasChanged(user: User, data: UpdateData) : boolean {
		return user.username != data.username;
    }

    // ----------------------------------------------------------------------------- //
    private getSortedFriendlist(requester: any[], receiver: any[], limit: number, userId: number): Friend[] {
        const allFriendships = [
            ...(requester || []),
            ...(receiver || []),
        ];

        // 1. Tri
        allFriendships.sort((a, b) => {
            const getFriendId = (r: Friendship) => r.requesterId === userId ? r.receiverId : r.requesterId;
            
            const isOnlineA = SocketEventController.isUserOnline(getFriendId(a));
            const isOnlineB = SocketEventController.isUserOnline(getFriendId(b));

            /* Priority Score:
               2 -> Ami (ACCEPTED) et Connecté
               1 -> Demande en attente (PENDING)
               0 -> Ami déconnecté ou autre
            */
            const getScore = (r: any, isOnline: boolean) => {
                if (r.status === 'ACCEPTED' && isOnline) return 2;
                if (r.status === 'PENDING') return 1;
                return 0;
            };

            return getScore(b, isOnlineB) - getScore(a, isOnlineA);
        });

        // 2. Limite
        const sliced = allFriendships.slice(0, limit);

        // 3. Transformation / Nettoyage
        return sliced.map(relation => {
            // On détermine qui est l'ami (l'autre personne dans la relation)
            const friend = relation.requesterId === userId ? relation.receiver : relation.requester;
            
            return {
                id: Number(friend.id),
                username: friend.username,
                avatar: friend.avatar,
                isOnline: SocketEventController.isUserOnline(friend.id),
                status: relation.status,
                requesterId: relation.requesterId,
            };
        });
    }
}
