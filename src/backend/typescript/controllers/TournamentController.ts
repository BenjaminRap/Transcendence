import { TournamentService } from '../services/TournamentService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament, TournamentProgress, PlayerInfo, TournamentState } from '../types/tournament.types.js';
import type { UsersService } from '../services/UsersService.js';


export class TournamentController {
    constructor(
        private tournamentService: TournamentService,
        private userService: UsersService,
    ) {}

    private tournamentLimitMax = 64;
    private tournamentLimitMin = 64;

	// ----------------------------------------------------------------------------- //
    async createTournament(data: CreateTournament) : Promise<{ success: boolean, message?: string, tournamentState?: TournamentState }> {
        // verification of admin and participants and match datas integrity
		const validation = await this.validateTournamentData(data);
		if (!validation.success) {
			return { success: false, message: validation.message };
		}

        try {
            const result = await this.tournamentService.createTournament(data);
            return { success: true, tournamentState: result };

        } catch (error) {
            console.error(error);

            if (error instanceof TournamentException)
                return { success: false, message: error?.message || error.code };
            
            return { success: false, message: 'Failed to create tournament.' };
        }
    }

	// ----------------------------------------------------------------------------- //
    async updateTournamentProgress(data: TournamentProgress): Promise<{ success: boolean, message?: string }> {
        const { tournamentId, matchsResults } = data;
        
        try {
            for (const matchResult of matchsResults) {
                await this.tournamentService.updateTournamentProgress(tournamentId, matchResult);
            }
            return { success: true };
        } catch (error) {
            console.error(error);
            if (error instanceof TournamentException) {
                return { success: false, message: error?.message || error.code };
            }
            return { success: false, message: 'Failed to update tournament progress.' };
        }
    }

	// ----------------------------------------------------------------------------- //
    async startNextMatch(data: { tournamentId: number, player1: PlayerInfo, player2: PlayerInfo } ): Promise<{success: boolean, matchId?: number}> {
        try {
            const { matchId } = await this.tournamentService.startNextMatch(data.tournamentId, data.player1, data.player2);
            return { success: true, matchId };
        } catch(error) {
            return { success: false };
        }
    }

	// ----------------------------------------------------------------------------- //
    async closeTournament(id: number): Promise<{ success: boolean }> {
        try {
            await this.tournamentService.finishTournament(id);
            return { success: true };            
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    }

	// ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId: number, adminId: number | null, adminGuestName: string): Promise<{ success: boolean }> {
        await this.tournamentService.cancelTournament(tournamentId, adminId, adminGuestName);
        return { success: true };
    }

    // ==================================== PRIVATE ==================================== //

    // ----------------------------------------------------------------------------- //
    private async validateTournamentData(data: CreateTournament): Promise<{ success: boolean, message?: string }> {
        // Basic Validation
        if (!data.adminUserId && !data.adminGuestName) {
            return {success: false, message: 'Admin user or guest name is required.'}
        }
        if (!data.title || data.title.length < 3 || data.title.length > 20) {
            return { success: false, message: 'Invalid tournament title.' }
        }
        
        // check if nb participant is power of 2
        const pCount = data.participants.length;
        if ((pCount & (pCount - 1)) !== 0) {
            return { success: false, message: 'Tournament are allowed with 4, 8, 16, 32, 64 players.' };
        }
        // and not exceed the limit
        if (pCount > this.tournamentLimitMax || pCount < this.tournamentLimitMin) {
            return { success: false, message: 'Participant limit exceeded. Tournament are allowed with 4, 8, 16, 32, 64 players.' }
        }

        // check Admin validity
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
            if (!p.alias )
                return { success: false, message: 'Participant alias is required.' };
            p.alias = p.alias.trim();
            if (p.alias.length < 3 || p.alias.length > 20) {
                return { success: false, message: 'Participant alias must be between 3 and 20 characters.' };
            }
            if (participantAliases.has(p.alias))
                return { success: false, message: `Duplicate participant alias: ${p.alias}` };

            participantAliases.add(p.alias);
            
            if (p.userId) {
                if (typeof p.userId !== 'number' || p.userId <= 0) {
                    return { success: false, message: 'Invalid participant user ID.' };
                }
                // check if user exist
                if (!await this.userService.checkIfUserExists(p.userId)) {
                    return { success: false, message: `Participant user with ID ${p.userId} does not exist.` };
                }
            }
            const idKey = p.userId ? `U_${p.userId}` : `G_${p.userGuestName}`;
            if (participantIds.has(idKey))
                return { success: false, message: `Duplicate participant ID/guest name: ${idKey}` };

            participantIds.add(idKey);
        }
        
        // Matchup Validation
        if (data.matchups.length !== data.participants.length / 2) {
             return { success: false, message: `Invalid number of matchups. Expected ${data.participants.length / 2}, got ${data.matchups.length}.` };
        }

        for(const m of data.matchups) {
            const p1Key = m.player1.id ? `U_${m.player1.id}` : `G_${m.player1.guestName}`;
            const p2Key = m.player2.id ? `U_${m.player2.id}` : `G_${m.player2.guestName}`;
            if (!participantIds.has(p1Key) || !participantIds.has(p2Key)) {
                return { success: false, message: `Invalid matchup between ${p1Key} and ${p2Key}` };
            }
        }

        return { success: true };
    }
}