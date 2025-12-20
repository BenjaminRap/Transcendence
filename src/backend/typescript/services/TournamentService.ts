import type { PrismaClient } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient,
	) {}

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(tournamentId: number, matchId: number): Promise<void> {
		await this.prisma.tournament.update({
			where: { id: tournamentId },
			data: {
				matches: {
					connect: { id: matchId },
				},
			},
		});
	}
	
	// ----------------------------------------------------------------------------- //

	// ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //
	async validateTournament(tournamentId: number): Promise<boolean> {
		const tournemant = await this.prisma.tournament.findUnique({
			where: { id: tournamentId },
			select: { id: true },
		});
		if (!tournemant)
			return false;
		return true;
	}

}