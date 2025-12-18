import type { PrismaClient } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import { MatchService } from './MatchService.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient,
		private matchService: MatchService,
	) {}

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(tournamentId: number, matchId: number) {
		// voir si le tournois existe
		if (!(await this.validateTournament(tournamentId)))
			throw new TournamentException(TournamentError.INVALID_TOURNAMENT_ID, 'Tournament not found');
		
		// voir si le match existe
		if (!await this.matchService.thisMatchExists(matchId))
			throw new TournamentException(TournamentError.INVALID_TOURNAMENT_ID, 'Match not found');
		
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