import { PrismaClient, User } from '@prisma/client';
import { GameStats, MatchHistoryEntry } from '../types/match.types.js';
import { MatchData, UpdateMatch } from '../types/match.types.js';
import { number } from 'zod';

export class MatchService {
	constructor(
		private prisma: PrismaClient,
	) {}

	// ----------------------------------------------------------------------------- //
	async registerMatch(matchData: MatchData): Promise<number>{
		const match = await this.prisma.match.create({
			data: {
				winnerId: matchData.winnerId,
				loserId: matchData.loserId,
				winnerLevel: matchData.winnerLevel,
				loserLevel: matchData.loserLevel,
				scoreWinner: matchData.scoreWinner,
				scoreLoser: matchData.scoreLoser,
				duration: matchData.duration,
				// tournamentId: matchData.tournamentId,
			}
		});

		return match.id;
	} 

    // ----------------------------------------------------------------------------- //
    async updateMatch(matchId: number, matchData: Partial<UpdateMatch>): Promise<void> {
        await this.prisma.match.update({
            where: { id: matchId },
            data: {
                winnerId: matchData.winnerId,
                loserId: matchData.loserId,
                winnerLevel: matchData.winnerLevel,
                loserLevel: matchData.loserLevel,
                scoreWinner: matchData.scoreWinner,
                scoreLoser: matchData.scoreLoser,
                duration: matchData.duration,
                // tournamentId: matchData.tournamentId,
            }
        });
    }

	// ----------------------------------------------------------------------------- //
    async registerTournamentMatch(matchData: MatchData, tournamentId: number ): Promise<number>{
        const match = await this.prisma.match.create({
            data: {
                winnerId: matchData.winnerId,
                loserId: matchData.loserId,
                winnerLevel: matchData.winnerLevel,
                loserLevel: matchData.loserLevel,
                scoreWinner: matchData.scoreWinner,
                scoreLoser: matchData.scoreLoser,
                duration: matchData.duration,
                tournamentId: tournamentId,
            }
        });
        return match.id;
    }

	// ----------------------------------------------------------------------------- //
	async getStats(playerIds: number[]): Promise<{stats: GameStats[] | null, message?: string }> {
		if (!this.theyExist(playerIds))
			return { stats: null, message: 'One or more players do not exist' }

		const wins = await this.prisma.match.groupBy({
			by: ['winnerId'],
			where: { winnerId: { in: playerIds } },
			_count: true
		});

		const losses = await this.prisma.match.groupBy({
			by: ['loserId'],
			where: { loserId: { in: playerIds } },
			_count: true
		});
		const stats = playerIds.map(id => {
			const won = wins.find(w => w.winnerId === id)?._count ?? 0;
			const lost = losses.find(l => l.loserId === id)?._count ?? 0;

			return {
				wins: won,
				losses: lost,
				total: won + lost,
				winRate: won + lost === 0 ? 0 : won / (won + lost),
			} as GameStats;
		});
		return { stats }
	}

	// ----------------------------------------------------------------------------- //
	async getMatchHistory(playerId: number): Promise<MatchHistoryEntry[] | null> {
		if (await this.isExisting(playerId) === false)
			throw new Error('Player does not exist');

		const matches = await this.prisma.match.findMany({
			where: {
				OR: [
					{ winnerId: playerId },
					{ loserId: playerId }
				]
			},
			select: {
				id: true,
				winner: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
				loser: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
				scoreWinner: true,
				scoreLoser: true,
				winnerId: true,
				createdAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		const history = matches.map(match => ({
			matchId: match.id,
			opponent: match.winnerId === playerId ? match.loser : match.winner,
			userResult: match.winnerId === playerId ? 'win' : 'loss',
			date: match.createdAt
		}) as MatchHistoryEntry);

		return history;
	}

	// ----------------------------------------------------------------------------- //
	async thisMatchExists(matchId: number): Promise<boolean> {
		const match = await this.prisma.match.findUnique({
			where: { id: matchId },
			select: { id: true }
		});
		return match !== null;
    }

	// ================================== PRIVATE ================================== //

	// ----------------------------------------------------------------------------- //
	private async theyExist(ids: number[]): Promise<boolean> {
		const existingUsers = await this.prisma.user.findMany({
			where: { id: { in: ids } },
			select: { id: true }
		});

		const existingIds = existingUsers.map(u => u.id);

		const missingIds = ids.filter(ids => !existingIds.includes(ids));

		if (missingIds.length > 0)
			false;
		return true;
	}

	// ----------------------------------------------------------------------------- //
	private async isExisting(id: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id: id },
			select: { id: true }
		});
		return user !== null;
	}
}