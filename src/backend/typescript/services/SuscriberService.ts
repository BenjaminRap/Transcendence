import { PrismaClient, User } from "@prisma/client";
import { SuscriberStats } from "../types/suscriber.types.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import { sanitizeUser, SanitizedUser } from '../types/auth.types.js'
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import path from 'path';
import fs from 'fs/promises';

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
    ) {}
    private uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '/app/uploads');
    private defaultAvatarFile = process.env.DEFAULT_AVATAR_FILE || 'default.webp';

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
    async updateAvatar(buffer: Buffer, userId: number): Promise<SanitizedUser | null> {
        /**
         * le fichier est sous forme de buffer
         * et a ce stade il est deja valide
         * il est pret a etre enregistre sur le disque
         * il faut mettre la db a jour avec le nouveau lien
         * 
        */
       
            const user = await this.getById(userId);
            if (!user) {
                throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
            }

            // create new avatar file name
            const filename = `avatar_${userId}_${Date.now()}.webp`;
            const filepath = path.join(this.uploadDir, filename);

            console.log('Saving avatar to: ', filepath);
            console.log('Current avatar: ', user.avatar);
            console.log('Current user: ', user.username);

            if (user.avatar && user.avatar !== this.defaultAvatarFile)
            {
                const oldAvatarPath = path.join(this.uploadDir, path.basename(user.avatar));
                try {
                    await fs.unlink(oldAvatarPath);
                } catch (error) {
                    console.warn('Old avatar file could not be deleted: ', error);
                }
            }

            // 7. SAUVEGARDE DU NOUVEAU FICHIER
            await fs.writeFile(filepath, buffer);

            // 8. MISE A JOUR DE LA DB
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { avatar: filename },
            });

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