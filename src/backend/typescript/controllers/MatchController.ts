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

            let resLeft;
            let resRight;

            if (match.playerLeftId) {
                resLeft = await this.matchService.getLastMatches(match.playerLeftId, 1);
                console.log(`left id: ${match.playerLeftId} resLeft:`, resLeft);
                if (resLeft.length > 0) {
                    SocketEventController.sendToUser(match.playerLeftId, 'match-update', resLeft[0]);
                    SocketEventController.sendToProfileWatchers(match.playerLeftId, 'match-update', resLeft[0]);

                    SocketEventController.sendToUser(match.playerLeftId, 'stat-update',  await this.matchService.getStat(match.playerLeftId));
                    SocketEventController.sendToProfileWatchers(match.playerLeftId, 'stat-update',  await this.matchService.getStat(match.playerLeftId));
                }
                else
                    console.log(`No recent matches found for playerLeftId: ${match.playerLeftId}`);
            }

            if (match.playerRightId) {
                resRight = await this.matchService.getLastMatches(match.playerRightId, 1);
                console.log("resRight:", resRight);
                if (resRight.length > 0) {
                    SocketEventController.sendToUser(match.playerRightId, 'match-update', resRight[0]);
                    SocketEventController.sendToProfileWatchers(match.playerRightId, 'match-update', resRight[0]);

                    SocketEventController.sendToUser(match.playerRightId, 'stat-update', await this.matchService.getStat(match.playerRightId));
                    SocketEventController.sendToProfileWatchers(match.playerRightId, 'stat-update', await this.matchService.getStat(match.playerRightId));
                }
                else
                    console.log(`No recent matches found for playerRightId: ${match.playerRightId}`);
            }

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
