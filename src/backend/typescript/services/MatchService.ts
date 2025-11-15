import { PrismaClient } from '@prisma/client';
import { GameStats } from '../types/match.types.js';

export class MatchService {
	constructor(
		private prisma: PrismaClient,
	) {}

	// ----------------------------------------------------------------------------- //
	async getStats(playerA: number, playerB: number): Promise<GameStats>{
		if (!this.isExist(playerA) || !this.isExist(playerB)) {
			throw new Error('User not found');
		}

		const gamesPlayed = await this.prisma.match.count({
			where: {
				OR: [
					{ winnerId: playerA },
					{ loserId: playerA }
				]
			}
		});

		const gamesWon = await this.prisma.match.count({
			where: { winnerId: playerA }
		});

		const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

		return {
			gamesPlayed,
			gamesWon,
			winRate: parseFloat(winRate.toFixed(2))
		} as GameStats;
	}

	// ----------------------------------------------------------------------------- //


	// ================================== PRIVATE ================================== //

	// ----------------------------------------------------------------------------- //
	private async isExist(id: number): Promise<boolean> {
		const user = await this.prisma.user.findFirst({ where: { id: Number(id) }, select: { id: true } });
		return user ? true : false;
	}

	// ----------------------------------------------------------------------------- //

}