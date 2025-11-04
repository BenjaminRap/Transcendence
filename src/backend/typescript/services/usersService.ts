import { PrismaClient } from "@prisma/client";
import { PublicProfile } from "../types/users.types.js";

export enum UserErrors
{
    USER_NOT_FOUND = 'User not found'
}

export class UsersService {
    constructor(
        private prisma: PrismaClient
    ) {}

    // ----------------------------------------------------------------------------- //
    async getById(id: number): Promise<PublicProfile> {
        const user = await this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                username: true,
                avatar: true
            }
        });
        if (!user) {
            throw new Error(UserErrors.USER_NOT_FOUND);
        }
        return user;
    }

    // ----------------------------------------------------------------------------- //
    async getByName(username: string): Promise<PublicProfile[]> {
        const user = await this.prisma.user.findMany({
            where: {
                username: { contains: username }
            },
            select: {
                id: true,
                username: true,
                avatar: true,
            },
            orderBy: { username: 'asc' },
            take: 10
        });
        if (!user) {
            throw new Error(UserErrors.USER_NOT_FOUND);
        }
        return user;
    }
}
