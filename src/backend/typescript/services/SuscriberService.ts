import { PrismaClient, User } from "@prisma/client";
import { UpdateData } from "../types/suscriber.types.js";
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
    async updateProfile(id: number, data: UpdateData): Promise<SanitizedUser> {
        const user = await this.getById(Number(id));
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        // throw SuscriberException if data match
        await this.hasChanged(user, data);

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
    private async hasChanged(user: User, data: UpdateData) {
        if (data.username && user.username === data.username)
            throw new SuscriberException(SuscriberError.USRNAME_ERROR, SuscriberError.USRNAME_ERROR);

        if (data.avatar && user.avatar === data.avatar)
            throw new SuscriberException(SuscriberError.AVATAR_ERROR, SuscriberError.AVATAR_ERROR);
    }
}