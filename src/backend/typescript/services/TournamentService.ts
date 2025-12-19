import type { PrismaClient } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import { MatchService } from './MatchService.js';
import { MatchTournamentData } from '../types/match.types.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient,
	) {}

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(tournamentId: number, matchId: number): Promise<void> {
		// mettre a jour le match dans le tournois
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
		// verifier si le tournoi est valide
		const tournemant = await this.prisma.tournament.findUnique({
			where: { id: tournamentId },
		});
		if (!tournemant)
			return false;
		return true;
	}

}