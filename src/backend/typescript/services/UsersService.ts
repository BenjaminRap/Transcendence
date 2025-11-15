import { PrismaClient } from "@prisma/client";
import { PublicProfile } from "../types/users.types.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";

export class UsersService {
    constructor(
        private prisma: PrismaClient
    ) {}

    // ----------------------------------------------------------------------------- //
    async getById(id: number, userId: number): Promise<PublicProfile> {
        if ( !await this.checkIfUserExists(userId) ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No suscriber found');
        }

        const user = await this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                username: true,
                avatar: true
            }
        });
        if (!user) {
            throw new UsersException(UsersError.USER_NOT_FOUND, 'User not found');
        }
        return user as PublicProfile;
    }

    // ----------------------------------------------------------------------------- //
    async getByName(username: string, userId: number): Promise<PublicProfile[]> {
        if ( !await this.checkIfUserExists(userId) ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No suscriber found');
        }

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

    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private async checkIfUserExists(id: number): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!user) {
            return false;
        }
        return true;
    }
}
