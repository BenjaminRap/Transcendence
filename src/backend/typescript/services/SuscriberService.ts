import { PrismaClient, User } from "@prisma/client";
import { SuscriberStats } from "../types/suscriber.types.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import { sanitizeUser, SanitizedUser } from '../types/auth.types.js'
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
    ) {}

    // ----------------------------------------------------------------------------- //
    async getProfile(id: number): Promise<SanitizedUser> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }
        
        return sanitizeUser(user);
    }

    // ----------------------------------------------------------------------------- //
    async updatePassword(id: number, newPassword: string): Promise<void> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
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
    async updateAvatar(userId: number, buffer: Buffer, origineFilename: string): Promise<SanitizedUser> {
        const user = await this.getById(Number(userId));
        if (!user)
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, 'User not found');

        /**
         * a ce niveau j'ai verifie la limite du nombre de fichier
         * limite de taille
         * type mime
         * je dois verifier que le format du fichier correspond a celui indiquer dans le type
         * analyse du magic number (je ne sais pas e que c'est)
        */
       return sanitizeUser(user);
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