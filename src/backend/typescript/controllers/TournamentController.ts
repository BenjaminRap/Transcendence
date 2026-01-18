import { TournamentService } from '../services/TournamentService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament, TournamentProgress, PlayerInfo } from '../types/tournament.types.js';
import type { UsersService } from '../services/UsersService.js';


export class TournamentController {
    constructor(
        private tournamentService: TournamentService,
        private userService: UsersService,
    ) {}

    private tournamentLimit = 64;

	// ----------------------------------------------------------------------------- //
    async createTournament(data: CreateTournament) : Promise<{ success: boolean, message?: string }> {
		const validation = await this.validateTournamentData(data);
		if (!validation.success) {
			return { success: false, message: validation.message };
		}

        try {
            const result = await this.tournamentService.createTournament(data);
            return { success: true };

        } catch (error) {
            if (error instanceof TournamentException) throw error;
            console.error(error);
            throw new TournamentException(TournamentError.TOURNAMENT_CREATION_FAILED);
        }
    }

	// ----------------------------------------------------------------------------- //
    async updateTournamentProgress(data: TournamentProgress): Promise<{ success: boolean }> {
        const { tournamentId, completedMatches } = data;
        
        try {
            for (const matchResult of completedMatches) {
                 const winnerId = typeof matchResult.winnerId === 'number' ? matchResult.winnerId : null;
                 const winnerGuestName = typeof matchResult.winnerId === 'string' ? matchResult.winnerId : null;
                 
                 await this.tournamentService.updateTournamentProgress(tournamentId, matchResult.matchId, winnerId, winnerGuestName);
            }
            return { success: true };
        } catch (error) {
             console.error(error);
             return { success: false };
        }
    }

	// ----------------------------------------------------------------------------- //
    async startNextMatch(data: { tournamentId: number, player1: PlayerInfo, player2: PlayerInfo } ): Promise<{success: boolean, matchId?: number}> {
        try {
            const match = await this.tournamentService.startNextMatch(data.tournamentId, data.player1, data.player2);
            return { success: true, matchId: match.id };
        } catch(error) {
            return { success: false };
        }
    }

	// ----------------------------------------------------------------------------- //
    async closeTournament(id: number): Promise<{ success: boolean }> {
         await this.tournamentService.finishTournament(id);
         return { success: true };
    }

	// ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId: number, adminId: number | string): Promise<{ success: boolean }> {
        await this.tournamentService.cancelTournament(tournamentId, adminId);
        return { success: true };
    }

    // ==================================== PRIVATE ==================================== //

    // ----------------------------------------------------------------------------- //
    private async validateTournamentData(data: CreateTournament): Promise<{ success: boolean, message?: string }> {
        // Basic Validation
        if (!data.title || data.title.length < 3 || data.title.length > 20) {
            return { success: false, message: 'Invalid tournament title.' };
        }

        // check UserId
        if (data.adminUserId ) {
            if (typeof data.adminUserId !== 'number' || data.adminUserId <= 0) {
                return { success: false, message: 'Invalid admin user ID.' };
            }
            // check if user exist
            if (!await this.userService.checkIfUserExists(data.adminUserId)) {
                return { success: false, message: 'Admin user does not exist.' };
            }
        }
        
        // Player Uniqueness
        const participantAliases = new Set<string>();
        const participantIds = new Set<number | string>();
        
        for(const p of data.participants) {
            if (!p.alias)
                return { success: false };

            if (participantAliases.has(p.alias))
                return { success: false };

            participantAliases.add(p.alias);
            
            const idKey = p.userId ? `U_${p.userId}` : `G_${p.userGuestName}`;
            if (participantIds.has(idKey))
                return { success: false };

            participantIds.add(idKey);
        }
        
        // Matchup Validation
        for(const m of data.matchups) {
            const p1Key = m.player1.id ? `U_${m.player1.id}` : `G_${m.player1.guestName}`;
            const p2Key = m.player2.id ? `U_${m.player2.id}` : `G_${m.player2.guestName}`;
            if (!participantIds.has(p1Key) || !participantIds.has(p2Key)) {
                return {success: false}
            }
        }
        
        // Admin Validation
        if (!data.adminUserId && !data.adminGuestName) {
            return {success: false}
        }
        if (data.adminUserId && data.adminGuestName) {
            return {success: false}
        }

        if (data.participants.length > this.tournamentLimit) {
            return {success: false}
        }
        return {success: true};
    }

}