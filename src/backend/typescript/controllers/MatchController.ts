import { MatchService } from '../services/MatchService.js';
import type { MatchData } from '../types/match.types.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
	) {}

    // =================================== PUBLIC ==================================== //

	// --------------------------------------------------------------------------------- //
    async registerMatch(data: MatchData): Promise<{ success: boolean, messageError?: string, matchId?: number }>
    {
        let match;
        try {
            match = await this.matchService.registerMatch(data);
            if (!match)
                return { success: false, messageError: "An error occurred when fetching the database" };

            return { success: true, matchId: match }
        }
        catch (error) {
            console.log(error);

            return { success: false, messageError: "An error occurred when fetching the database" };
        }
    }

    // --------------------------------------------------------------------------------- //
    async registerTournamentMatch(tournamentId: number, data: MatchData): Promise<{ success: boolean, messageError?: string, matchId?: number }>
    {
        let match;
        try {
            match = await this.matchService.registerTournamentMatch(tournamentId, data);
            if (!match)
                return { success: false, messageError: "An error occurred when fetching the database" };
    
            return { success: true, matchId: match }
        }
        catch (error) {
            console.log(error);

            return { success: false, messageError: "An error occurred when fetching the database" };
        }
    }
}
