import { PrismaClient, User } from "@prisma/client";
import { SuscriberStats } from "../types/suscriber.types.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import { FileService } from "./FileService.js";
import { sanitizeUser, SanitizedUser } from '../types/auth.types.js'
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import path from "path";

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
        private fileService: FileService
    ) {}
    private api_url = process.env.API_URL || 'http://localhost:8181';

    // ----------------------------------------------------------------------------- //
    async getProfile(id: number): Promise<SanitizedUser> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }
        
        return sanitizeUser(user);
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
    async updateUsername(id: number, newName: string): Promise<SanitizedUser> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        // throw SuscriberException if data match
        if (this.hasChanged(user.username, newName))
            throw new SuscriberException(SuscriberError.USRNAME_ERROR, 'SuscriberError.USRNAME_ERROR');

        // check username availability
        if (newName) {
            const existingUser = await this.prisma.user.findFirst({
                where: { username: newName }
            });
            if (existingUser) {
                throw new SuscriberException(SuscriberError.USRNAME_ALREADY_USED,SuscriberError.USRNAME_ALREADY_USED);
            }
        }

        // update user in DB
        const updatedUser = await this.prisma.user.update({
            where: { id: Number(id) },
            data: { username: newName },
        });

        return sanitizeUser(updatedUser);
    }

    // ----------------------------------------------------------------------------- //
    async updateAvatar(buffer: Buffer, userId: number): Promise<SanitizedUser> {
        const user = await this.getById(userId);
        if (!user)
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        if (!user.avatar)
            console.warn("User avatar empty, user id: ", user.id);

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
    async deleteAccount(id: number): Promise<void> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        await this.prisma.user.delete({
            where: { id: Number(id) }
        });
    }

    // ----------------------------------------------------------------------------- //
    async getStats(id: number): Promise<SuscriberStats>{
        if (!this.isExist(id)) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        const gamesPlayed = await this.prisma.match.count({
            where: {
                OR: [
                    { winnerId: id },
                    { loserId: id }
                ]
            }
        });

        const gamesWon = await this.prisma.match.count({
            where: { winnerId: id }
        });

        const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

        return {
            gamesPlayed,
            gamesWon,
            winRate: parseFloat(winRate.toFixed(2))
        } as SuscriberStats;
    }

    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async getById(id: number): Promise<User | null> {
        return await this.prisma.user.findFirst({ where: { id } });
    }

    // ----------------------------------------------------------------------------- //
    private async isExist(id: number): Promise<boolean> {
        const user = await this.prisma.user.findFirst({ where: { id: Number(id) }, select: { id: true } });
        return user ? true : false;
    }
    // ----------------------------------------------------------------------------- //
    private hasChanged(userData: any, comparedData: any): boolean {
        return userData === comparedData;
    }
}

