import { MatchService } from '../services/MatchService.js';
import type { MatchData } from '../types/match.types.js';
import { SocketEventController } from './SocketEventController.js';

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

            SocketEventController.notifyProfileChange(match.playerLeftId, 'match-update', match);
            SocketEventController.notifyProfileChange(match.playerRightId, 'match-update', match);

            return { success: true, matchId: match.id }
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
