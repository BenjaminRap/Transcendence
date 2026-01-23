import { MatchService } from '../services/MatchService.js';
import type { MatchData } from '../types/match.types.js';
import { randomUUID } from 'crypto';

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
        }
        catch (error) {
            return { success: false, messageError: "An error occurred when fetching the database" };
        }
        if (!match)
            return { success: false, messageError: "An error occurred when fetching the database" };

        return { success: true, matchId: match }
    }

    // --------------------------------------------------------------------------------- //
    async registerTournamentMatch(tournamentId: number, data: MatchData): Promise<{ success: boolean, messageError?: string, matchId?: number }>
    {
        let match;
        try {
            match = await this.matchService.registerTournamentMatch(tournamentId, data);
        }
        catch (error) {
            return { success: false, messageError: "An error occurred when fetching the database" };
        }
        if (!match)
            return { success: false, messageError: "An error occurred when fetching the database" };

        return { success: true, matchId: match }
    }

    // --------------------------------------------------------------------------------- //
    public generateName(level: string): string {
        return `${level}${randomUUID().split('-')[0]}`;
    }

}
