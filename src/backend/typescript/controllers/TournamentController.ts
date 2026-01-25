import { TournamentService } from '../services/TournamentService.js';
import type { CreateTournament, Ranking } from '../types/tournament.types.js';
import type { MatchController } from './MatchController.js';
import type { MatchData } from '../types/match.types.js';
import { error, success, type Result } from '@shared/utils.js';

export class TournamentController {
    constructor(
        private tournamentService: TournamentService,
        private matchController: MatchController,
    ) {}

	// ----------------------------------------------------------------------------- //
    async createTournament(data: CreateTournament) : Promise<Result<number>> {
        try {
            const result = await this.tournamentService.createTournament(data);
            if (!result) {
                return error('Failed to create tournament.');
            }
            return success(result);

        } catch (e) {
            console.log(e);
			return error('Failed to create tournament.');
        }
    }

	// ----------------------------------------------------------------------------- //
    async updateTournament(tournamentId: number, matchData: MatchData): Promise<{success: boolean, matchId?: number}> {
        try {
            if ( ! await this.matchController.registerTournamentMatch(tournamentId, matchData) )
                return { success: false };

            return { success: true };
        } catch(error) {
            console.log(error);

            return { success: false };
        }
    }

	// ----------------------------------------------------------------------------- //
    async closeTournament(id: number, ranking: Ranking[]): Promise<{ success: boolean }> {
        try {
            await this.tournamentService.finishTournament(id, ranking);
            return { success: true };            
        } catch (error) {
            console.log(error);
            return { success: false };
        }
    }
}
