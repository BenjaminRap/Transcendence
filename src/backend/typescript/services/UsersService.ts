import { PrismaClient } from "@prisma/client";
import type { PublicProfile, UserSearchResult } from "../types/users.types.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";
import type { GameStats } from "../types/match.types.js";

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
            where: { id: Number(id) },
			include: {
				matchesWons: true,
				matchesLoses: true
			}
        });
        if (!user) {
            throw new UsersException(UsersError.USER_NOT_FOUND, 'User not found');
        }

		const gameStats: GameStats = this.calculateStats(user);

		const lastMatchs = [
			...(user.matchesWons || []),
			...(user.matchesLoses || [])
		]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 4);

        return {
			id: user.id,
			avatar: user.avatar,
			username: user.username,
			stats: gameStats,
			lastMatchs: lastMatchs
		}
    }

    // ----------------------------------------------------------------------------- //
    async getByName(username: string, userId: number): Promise<UserSearchResult[]> {
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
