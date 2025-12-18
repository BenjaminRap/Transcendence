import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MatchData } from '../types/match.types';


export class TournamentController {
	constructor(
		// private tournamentService: TournamentService,
	) {}

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(tournamentId: number, matchId: number) {
		// voir si le tournois existe
		// mettre a jour le match dans le tournois
		
		
		return;
	}
	
	// ----------------------------------------------------------------------------- //

	// ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //
	async validateTournament(tournamentId: number): Promise<boolean> {
		// verifier si le tournoi est valide
		const tournemant = await
		return true;
	}

}