import { PrismaClient } from '@prisma/client';
import { GameStats } from '../types/match.types.js';
import { number } from 'zod';

export class MatchService {
	constructor(
		private prisma: PrismaClient,
	) {}

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
	
}