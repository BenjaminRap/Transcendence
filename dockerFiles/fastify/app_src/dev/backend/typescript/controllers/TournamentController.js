import { TournamentService } from '../services/TournamentService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import { CommonSchema } from "../schemas/common.schema.js";
export class TournamentController {
    constructor(tournamentService, userService) {
        this.tournamentService = tournamentService;
        this.userService = userService;
        this.tournamentLimitMax = 64;
        this.tournamentLimitMin = 64;
    }
    // ----------------------------------------------------------------------------- //
    async createTournament(data) {
        // verification of admin and participants and match datas integrity
        const validation = await this.validateTournamentData(data);
        if (!validation.success) {
            return { success: false, message: validation.message };
        }
        try {
            const result = await this.tournamentService.createTournament(data);
            return { success: true, tournamentState: result };
        }
        catch (error) {
            console.error(error);
            if (error instanceof TournamentException)
                return { success: false, message: error?.message || error.code };
            return { success: false, message: 'Failed to create tournament.' };
        }
    }
    // ----------------------------------------------------------------------------- //
    async updateTournamentProgress(data) {
        const { tournamentId, matchsResults } = data;
        try {
            for (const matchResult of matchsResults) {
                await this.tournamentService.updateTournamentProgress(tournamentId, matchResult);
            }
            return { success: true };
        }
        catch (error) {
            console.error(error);
            if (error instanceof TournamentException) {
                return { success: false, message: error?.message || error.code };
            }
            return { success: false, message: 'Failed to update tournament progress.' };
        }
    }
    // ----------------------------------------------------------------------------- //
    async startNextMatch(data) {
        try {
            const { matchId } = await this.tournamentService.startNextMatch(data.tournamentId, data.player1, data.player2);
            return { success: true, matchId };
        }
        catch (error) {
            return { success: false };
        }
    }
    // ----------------------------------------------------------------------------- //
    async closeTournament(id) {
        try {
            await this.tournamentService.finishTournament(id);
            return { success: true };
        }
        catch (error) {
            console.error(error);
            return { success: false };
        }
    }
    // ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId, adminId, adminGuestName) {
        await this.tournamentService.cancelTournament(tournamentId, adminId, adminGuestName);
        return { success: true };
    }
    // ----------------------------------------------------------------------------- //
    /**
     * faire une fonction simple qui permet de recuperer les tournois d'un user
     * avec en reponse un champ pour la liste des joueur dans l'ordre du gagnant au perdant
     * un autre champs avec lescore des matchs, et l'avatar et l'aliasde chaque joueur
     */
    async getUserTournaments(request, reply) {
        const userId = parseInt(request.params.id);
        const valid = CommonSchema.id.parse(userId);
        if (!valid) {
            return { success: false, message: 'Invalid user ID.' };
        }
        try {
            const tournaments = await this.tournamentService.getUserTournaments(valid);
            return { success: true, tournaments };
        }
        catch (error) {
            console.error(error);
            return { success: false, message: 'Failed to retrieve user tournaments.' };
        }
    }
    // ==================================== PRIVATE ==================================== //
    // ----------------------------------------------------------------------------- //
    async validateTournamentData(data) {
        // Basic Validation
        if (!data.adminUserId && !data.adminGuestName) {
            return { success: false, message: 'Admin user or guest name is required.' };
        }
        if (!data.title || data.title.length < 3 || data.title.length > 20) {
            return { success: false, message: 'Invalid tournament title.' };
        }
        // check if nb participant is power of 2
        const pCount = data.participants.length;
        if ((pCount & (pCount - 1)) !== 0) {
            return { success: false, message: 'Tournament are allowed with 4, 8, 16, 32, 64 players.' };
        }
        // check Admin validity
        if (data.adminUserId) {
            if (typeof data.adminUserId !== 'number' || data.adminUserId <= 0) {
                return { success: false, message: 'Invalid admin user ID.' };
            }
            // check if user exist
            if (!await this.userService.checkIfUserExists(data.adminUserId)) {
                return { success: false, message: 'Admin user does not exist.' };
            }
        }
        return { success: true };
    }
}
