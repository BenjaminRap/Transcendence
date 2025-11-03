import { PrismaClient } from "@prisma/client";

interface PublicProfile
{
    id:         number,
    username:   string,
    avatar:     string
}

interface Public
{
    id:         number,
    username:   string
}


export class UsersService {
    constructor( private prisma: PrismaClient ) {}

    // ----------------------------------------------------------------------------- //

    async getUserById(id: number): Promise<PublicProfile | null> {
        const user = await this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                username: true,
                avatar: true
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    // ----------------------------------------------------------------------------- //

    async getUserByName(username: string): Promise<Public[] | null> {
        const user = await this.prisma.user.findMany({
            where: {
                username: { contains: username }
            },
            select: {
                username: true,
                id: true,
            },
            orderBy: { username: 'asc' },
            take: 10
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
