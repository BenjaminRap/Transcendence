import { PrismaClient, type User } from "@prisma/client";
import { type UpdateData } from "../types/suscriber.types.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import { FileService } from "./FileService.js";
import { sanitizeUser, type SanitizedUser } from '../types/auth.types.js'
import type { SuscriberProfile } from "../types/suscriber.types.js";
import type { GameStats } from "../types/match.types.js";
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import path from "path";

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
        private fileService: FileService
    ) {}
    private api_url = process.env.API_URL || 'https://localhost:8181/api';
    private default_avatar_url = process.env.DEFAULT_AVATAR_URL || this.api_url + '/static/public/avatarDefault.png';

    // ----------------------------------------------------------------------------- //
    async getProfile(id: number): Promise<SuscriberProfile> {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                matchesWons: true,
                matchesLoses: true,
                sentRequests: true,
                receivedRequests: true,
            },
        });

        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

		const stats: GameStats = this.calculateStats(user);

		// Get last 4 matches
        const allMatches = [
            ...(user.matchesWons || []),
            ...(user.matchesLoses || []),
        ]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

		// Sorted friendships
        const sortedFriendships = [
            ...(user.sentRequests || []),
            ...(user.receivedRequests || []),
        ]
		.sort((a, b) => {
			if (a.status === "PENDING" && b.status !== "PENDING") return -1;
			if (a.status !== "PENDING" && b.status === "PENDING") return 1;
			return 0;
		})
		.slice(0, 4);

        return {
            id: user.id.toString(),
            avatar: user.avatar,
            username: user.username,
            gameStats: stats,
            lastMatchs: allMatches,
            friends: sortedFriendships,
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

        if (user.password === newPassword) {
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
    async updateUsername(id: number, data: UpdateData): Promise<SanitizedUser> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        // throw SuscriberException if data match
		if (this.hasChanged(user, data) === false)
			throw new SuscriberException(SuscriberError.USRNAME_ERROR, SuscriberError.USRNAME_ERROR);

        // check username availability
        if (data.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: { username: data.username }
            });
            if (existingUser) {
                throw new SuscriberException(SuscriberError.USRNAME_ALREADY_USED,SuscriberError.USRNAME_ALREADY_USED);
            }
        }

        // update user in DB
        const updatedUser = await this.prisma.user.update({
            where: { id: Number(id) },
            data: {
                username: data.username ?? user.username,
                avatar: data.avatar ?? user.avatar
            },
        });

        return sanitizeUser(updatedUser);
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
        const newAvatarPath = path.join('/static/avatars/', path.basename(avatarFileName));
        const newAvatarUrl = this.api_url + newAvatarPath;
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { avatar: newAvatarUrl },
            });
            
            await this.fileService.deleteAvatar(oldAvatarUrl);

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

        await this.fileService.deleteAvatar(oldAvatarUrl);

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
        return await this.prisma.user.findFirst({ where: { id } });
    }

    // ----------------------------------------------------------------------------- //
    private hasChanged(user: User, data: UpdateData) : boolean {
		return user.username != data.username;
    }
	
	// ----------------------------------------------------------------------------- //
	private calculateStats(user: any): GameStats {
		const matchesWon = user.matchesWons?.length || 0;
		const matchesLost = user.matchesLoses?.length || 0;
		const totalMatches = matchesWon + matchesLost;
		const ratio = totalMatches > 0 ? (matchesWon / totalMatches * 100).toFixed(2) : "0.00";

		return {
			wins: matchesWon,
			losses: matchesLost,
			total: totalMatches,
			winRate: parseFloat(ratio),
		};
	}
}

