import { PrismaClient, User } from "@prisma/client";
import { UpdateData } from "../types/suscriber.types";
import { sanitizeUser, SanitizedUser } from '../types/auth.types'
import { SuscriberException } from "../error_handlers/suscriber.error";
import { PasswordHasher } from "../utils/passwordHasher";

export enum SuscriberError
{
    USER_NOT_FOUND = 'User not found',
    USRNAME_ERROR = 'Username must change',
    PASSWD_ERROR = 'Password must change',
    AVATAR_ERROR = 'Avatar must change',
    USRNAME_ALREADY_USED = 'This username is already used',
}

export class SuscriberService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
    ) {}

    // ----------------------------------------------------------------------------- //
    async getProfile(id: number): Promise<SanitizedUser> {
        const user = await this.getById(id);
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }
        
        return sanitizeUser(user);
    }

    // ----------------------------------------------------------------------------- //
    async updateProfile(id: number, data: UpdateData): Promise<SanitizedUser> {
        const user = await this.getById(id);
        if (!user) {
            throw new SuscriberException(SuscriberError.USER_NOT_FOUND, SuscriberError.USER_NOT_FOUND);
        }

        // throw SuscriberException if data match
        this.hasChanged(user, data);

        // check username availability
        if (data.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: { username: data.username }
            });
            if (existingUser) {
                throw new SuscriberException(SuscriberError.USRNAME_ALREADY_USED,SuscriberError.USRNAME_ALREADY_USED);
            }
        }

        // hash password if changed
        if (data.password) {
            data.password = await this.passwordHasher.hash(data.password);
        }

        // update user in DB
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                username: data.username ?? user.username,
                password: data.password ?? user.password,
                avatar: data.avatar ?? user.avatar
            },
            select: {
                id: true,
                username: true,
                avatar: true
            }
        });

        return sanitizeUser(updatedUser);
    }

    // ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    private async getById(id: number) {
        const user = await this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                username: true,
                avatar: true
            }
        });
        return user;
    }

    // ----------------------------------------------------------------------------- //
    private async hasChanged(user: User, data: UpdateData) {
        if (data.username && user.username === data.username)
            throw new SuscriberException(SuscriberError.USRNAME_ERROR, SuscriberError.USRNAME_ERROR);

        if (data.password && await this.passwordHasher.verify(data.password, user.password))
            throw new SuscriberException(SuscriberError.PASSWD_ERROR, SuscriberError.PASSWD_ERROR);

        if (data.avatar && user.avatar === data.avatar)
            throw new SuscriberException(SuscriberError.AVATAR_ERROR, SuscriberError.AVATAR_ERROR);
    }
}