import { PrismaClient, type User } from "@prisma/client";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import { FileService } from "./FileService.js";
import { sanitizeUser } from '../types/auth.types.js'
import type { SuscriberProfile } from "../types/suscriber.types.js";
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import path from "path";
import type { Friend } from "../types/suscriber.types.js";
import type { MatchService } from "./MatchService.js";
import type { GameStats, SanitizedUser } from "@shared/ServerMessage.js";
import type { FriendService } from "./FriendService.js";
import type { ListFormat } from "../types/friend.types.js";
import type { MatchSummary } from "../types/match.types.js";

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
        private fileService: FileService,
        private matchService: MatchService,
        private friendService: FriendService,
    ) {}
    private api_url = process.env.API_URL || 'https://localhost:8080/api';
    private default_avatar_filename = 'avatarDefault.webp';
    private default_avatar_url = this.api_url + '/static/public/' + this.default_avatar_filename;

    // ----------------------------------------------------------------------------- //
    async getProfile(id: number): Promise<SuscriberProfile> {
        const takeLimit = 10; 

        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                matchsAsLeft: { 
                    include: { playerRight: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit
                },
                matchsAsRight: { 
                    include: { playerLeft: true },
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

        const lastsMatchs = await this.matchService.getLastMatches(id, 4);

        const stats: GameStats = await this.matchService.getStat(id);

        const friendList = await this.friendService.getFriendsList(id);
        const sortedFriends = this.getSortedFriendlist(friendList, 4);

        return {
            id: user.id,
            avatar: user.avatar,
            username: user.username,
            gameStats: stats,
            lastMatchs: lastsMatchs,
            friends: sortedFriends,
        };
    }

    // ----------------------------------------------------------------------------- //
    async getAllMatches(id: number): Promise<MatchSummary[]> {

        const matches = await this.matchService.getAllMatches(id);

        // console.log('SuscriberService - getAllMatches - matches: ', matches);
        return matches;
    }
    
	// ----------------------------------------------------------------------------- //
    async updatePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id: Number(id) }, select: { password: true } });
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
    async updateUsername(id: number, newName: string): Promise<User> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        // throw SuscriberException if data match
		if (user.username === newName)
			throw new SuscriberException(SuscriberError.USRNAME_ERROR, SuscriberError.USRNAME_ERROR);

        // check username availability
        if (await this.prisma.user.count({ where: { username: newName } }) > 0) {
            throw new SuscriberException(SuscriberError.USRNAME_ALREADY_USED,SuscriberError.USRNAME_ALREADY_USED);
        }

        // update user in DB
        const updatedUser = await this.prisma.user.update({
            where: { id: Number(id) },
            data: { username: newName },
        });

        return updatedUser;
    }

    // ----------------------------------------------------------------------------- //
    async updateAvatar(buffer: Buffer, userId: number): Promise<SanitizedUser> {
        const user = await this.getById(userId);
        if (!user)
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);

       // upload avatar, never throw but returns empty string if an error occured
        const avatarFileName = await this.fileService.uploadAvatarSafe(buffer, String(userId));
        if (!avatarFileName)
            throw new SuscriberException(SuscriberError.UPLOAD_ERROR, SuscriberError.UPLOAD_ERROR);
        
        const oldAvatarUrl = user.avatar;
        const newAvatarUrl = `${this.api_url}/static/avatars/${path.basename(avatarFileName)}`;

        // this try catch is used to rollback avatar upload if DB update fails
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: Number(userId) },
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
            where: { id: Number(userId) },
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

        await this.prisma.user.delete({ where: { id: Number(id) } });
    }

    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async getById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { id: Number(id) } });
    }

    // ----------------------------------------------------------------------------- //
    private getSortedFriendlist(list: ListFormat[], limit: number): Friend[] {
        if (list.length === 0) return [];

        list.sort((a, b) => {
            if (!a.user || !b.user) return 0;

            const isOnlineA = a.user.isOnline;
            const isOnlineB = b.user.isOnline;

            // Priority Score: 2: accepted and online, 1: pending, 0: offline or other
            const getScore = (item: ListFormat, isOnline: boolean) => {
                if (item.status === 'ACCEPTED' && isOnline) return 2;
                if (item.status === 'PENDING') return 1;
                return 0;
            };

            return getScore(b, isOnlineB) - getScore(a, isOnlineA);
        });

        const formatedList = list.slice(0, limit);

        return formatedList.map(item => {
            if (!item.user) {
                throw new SuscriberException(SuscriberError.USER_NOT_FOUND, 'A ghost user was found in friend list');
            }
            return {
                id: item.user.id,
                username: item.user.username,
                avatar: item.user.avatar,
                isOnline: item.user.isOnline,
                status: item.status,
                requesterId: item.user.requesterId,
            };
        });
    }
}
