import { MatchService, type MatchWithRelations } from '../services/MatchService.js';
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

            const matchs = await this.matchService.getFirstMAtch(match);
            let resultLeft = await this.matchService.formatMatchSummaryLeft(matchs as MatchWithRelations[]);
            let resultRight = await this.matchService.formatMatchSummaryRight(matchs as MatchWithRelations[]);


            let leftId = match.playerLeftId ? match.playerLeftId : 0;
            let rightId = match.playerRightId ? match.playerRightId : 0;
            console.log("=======", resultLeft[0], "=========");
            SocketEventController.sendToUser(leftId, 'match-update', resultLeft[0]);
            SocketEventController.sendToUser(rightId, 'match-update', resultRight[0]);
            SocketEventController.sendToUser(leftId, 'stat-update',  await this.matchService.getStat(leftId));
            SocketEventController.sendToUser(rightId, 'stat-update', await this.matchService.getStat(rightId));
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
