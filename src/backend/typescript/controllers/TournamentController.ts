import type { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentService } from '../services/TournamentService.js';
import { TournamentException } from '../error_handlers/Tournament.error.js';
import type { CreateTournament } from '../types/tournament.types.js';
import type { UsersService } from '../services/UsersService.js';
import { CommonSchema } from "../schemas/common.schema.js";
import type { MatchController } from './MatchController.js';
import type { MatchData } from '../types/match.types.js';

export class TournamentController {
    constructor(
        private tournamentService: TournamentService,
        private matchController: MatchController,
    ) {}

	// ----------------------------------------------------------------------------- //
    async createTournament(data: CreateTournament) : Promise<{ success: boolean, tournamentId?: number, messageError?: string }> {
        try {
            const result = await this.tournamentService.createTournament(data);
            if (!result) {
                return { success: false, messageError: 'Failed to create tournament.' };
            }
            return { success: true, tournamentId: result };

        } catch (error) {
            console.error(error);

            if (error instanceof TournamentException)
                return { success: false, messageError: error?.message || error.code };

            return { success: false, messageError: 'Failed to create tournament.' };
        }
    }

	// ----------------------------------------------------------------------------- //
    async updateTournament(tournamentId: number, matchData: MatchData): Promise<{success: boolean, matchId?: number}> {
        try {
            const { matchId } = await this.matchController.registerTournamentMatch(tournamentId, matchData);
            return { success: true };
        } catch(error) {
            return { success: false };
        }
    }

	// ----------------------------------------------------------------------------- //
    async closeTournament(id: number, ranking: { PlayerAlias: string, rank: number }[]): Promise<{ success: boolean }> {
        try {
            await this.tournamentService.finishTournament(id, ranking);
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

    // ----------------------------------------------------------------------------- //
    /**
     * faire une fonction simple qui permet de recuperer les tournois d'un user
     * avec en reponse un champ pour la liste des joueur dans l'ordre du gagnant au perdant
     * un autre champs avec lescore des matchs, et l'avatar et l'aliasde chaque joueur
     */
    // async getUserTournaments(request: FastifyRequest<{ Params: {id: string} }>, reply: FastifyReply): Promise<{ success: boolean, tournaments?: UserTournament[], message?: string }> {
    //     const userId = parseInt(request.params.id);
    //     const valid = CommonSchema.id.parse(userId);
    //     if (!valid) {
    //         return { success: false, message: 'Invalid user ID.' };
    //     }
    //     try {
    //         const tournaments = await this.tournamentService.getUserTournaments(valid);
    //         return { success: true, tournaments };
    //     } catch (error) {
    //         console.error(error);
    //         return { success: false, message: 'Failed to retrieve user tournaments.' };
    //     }
    // }

}