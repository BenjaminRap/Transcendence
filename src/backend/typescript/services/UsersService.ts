import { PrismaClient } from "@prisma/client";
import { PublicProfile } from "../types/users.types.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";

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
            throw new UsersException(UsersError.USER_NOT_FOUND, UsersError.USER_NOT_FOUND);
        }
        return user;
    }

    // ----------------------------------------------------------------------------- //
    async getByName(username: string): Promise<PublicProfile[]> {
        const users = await this.prisma.user.findMany({
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
        if ( !users.length ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No one was found');
        }
        return users;
    }
}
