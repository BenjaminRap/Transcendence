import { MatchService } from '../services/MatchService.js';
import type { MatchData } from '../types/match.types.js';
import { FriendService } from '../services/FriendService.js';
import { randomUUID } from 'crypto';

export class MatchController {
	constructor(
		private matchService: MatchService,
	) {}

    // =================================== PUBLIC ==================================== //

	// --------------------------------------------------------------------------------- //
    async registerMatch(data: MatchData): Promise<{ success: boolean, messageError?: string, matchId?: number }>
    {
        if (!data.winner)
            data.winner = this.generateName("Guest");
        if (!data.loser)
            data.loser = this.generateName("Guest");

        const winnerGuestName = typeof data.winner === "string" ? data.winner : this.generateName("User");
        const loserGuestName = typeof data.loser === "string" ? data.loser : this.generateName("User");

        let match;
        try {
            match = await this.matchService.registerMatch(data, winnerGuestName, loserGuestName);
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
        if (!data.winner)
            data.winner = this.generateName("Guest");
        if (!data.loser)
            data.loser = this.generateName("Guest");

        const winnerGuestName = typeof data.winner === "string" ? data.winner : this.generateName("User");
        const loserGuestName = typeof data.loser === "string" ? data.loser : this.generateName("User");

        let match;
        try {
            match = await this.matchService.registerTournamentMatch(tournamentId, data, winnerGuestName, loserGuestName);
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
