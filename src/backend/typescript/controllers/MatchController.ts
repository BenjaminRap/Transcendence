import type { FastifyRequest, FastifyReply } from 'fastify';
import { type User, Match } from '@prisma/client';
import { MatchService } from '../services/MatchService.js';
import { TournamentService } from '../services/TournamentService.js';
import { CommonSchema } from '../schemas/common.schema.js';
import type { StartMatchData, EndMatchData, MatchData, OPPONENT_LEVEL } from '../types/match.types.js';
import { MatchException, MatchError } from '../error_handlers/Match.error.js';
import { FriendService } from '../services/FriendService.js';
import { SocketEventController } from './SocketEventController.js';
import { randomUUID } from 'crypto';


export class MatchController {
	constructor(
		private matchService: MatchService,
		private friendService: FriendService,
		private tournamentService: TournamentService,
	) {}


	// ----------------------------------------------------------------------------- //
	// /api/match/history
	async getMatchHistory(request: FastifyRequest, reply: FastifyReply){
		try {
			const id = (request as any).user.userId;

			// verification pathern
			const zodParsing = CommonSchema.id.safeParse(Number(id));
			if (!zodParsing.success)
				return { success: false, message: zodParsing.error?.issues?.[0]?.message || 'Error id format' }
	
			// call db 
			const history = await this.matchService.getMatchHistory(zodParsing.data);
			if (!history)
				return { success: false, message: 'Error retrieving match history'}
	
			return {
				success: true,
				history: history
			};			
		} catch (error) {
			return {
				success: false,
				message: 'Error retrieving data from the database: ' + (error instanceof Error ? error.message : '' )
			}
		}
	}

    /**
     * il y a des match de tournois et des match clasiques
     * dans tous les cas les joueurs peuvent etre des humain avec ou sans compte client
     * les matchs contre des IA sont aussi possibles
     * 
     * dans le cas ou un ou plusieurs guests sont presents, on genere un alias aleatoire
     * 
     * seul les match en remote sont enregistres ici
     * 
     * on renregistre les matchs en deux temps:
     * - verification des donnees recues (id ou level de chaque joueur)
     * - enregistrement du match en DB avec le status 'match en cours'
     * - on renvoie l'id du match au jeu
     * 
     * 
     * la classe contient un tableau dynamique de match en cours :
     * 
     *   map<idMatch, {player1: {id?: number, level?: string}, player2: {id?: number, level?: string}}>
     * 
     * 
     * lorsqu'un match est termine, on recoit un objet matchData de la forme:
     * {
     *  winnerId: number | undefined,    // id du joueur gagnant (si compte client)
     *  winnerLevel: string | undefined, // level du joueur gagnant (si guest ou IA)
     *  loserId: number | undefined,     // id du joueur perdant (si compte client)
     *  loserLevel: string | undefined,  // level du joueur perdant (si guest ou IA)
     *  scoreWinner: number,            // score du gagnant
     *  scoreLoser: number,             // score du perdant
     *  duration: number,               // duree du match en secondes
     *  idMatch: number | undefined      // id du match pour pouvoir l'update 
     * }
     * 
     * les regles sont les suivantes:
     * - si id est defini, on utilise l'id pour retrouver le joueur
     * - si level est defini et id non defini, on utilise level pour definir le type d'adversaire
     * - si ni id ni level ne sont definis, on renvoie une erreur
     * 
     * les valeurs possibles pour level sont:
     * - GUEST: adversaire humain sans compte client
     * - AI: un seul type d'IA pour l'instant (a definir plus tard si besoin de plusieurs niveaux)
     * 
     * exemple de matchData:
     * {
     *   winnerId: 123,           // joueur avec compte client
     *   loserLevel: 'GUEST'      // adversaire humain sans compte client
     * }
     * 
     */


    // --------------------------------------------------------------------------------- //
    async startMatch(data: StartMatchData): Promise<{ success: boolean, matchId?: number, message?: string }> {
        try {
            const player1 = await this.checkMatchData(data.player1.level, data.player1.id);
            data.player1.id = player1.id;
            data.player1.level = player1.level;

            const player2 = await this.checkMatchData(data.player2.level, data.player2.id);
            data.player2.id = player2.id;
            data.player2.level = player2.level;

            const matchId = await this.matchService.startMatch(data.player1, data.player2);
            return { 
                success: true,
                matchId: matchId
            };
        }
        catch (error) {
            if (error instanceof MatchException)
                return { success: false, message: error?.message || "An error occurred during the start of the match." };

            console.warn(error);
            return { success: false, message: "An error occurred when fetching the database" };
        }
    }

	// --------------------------------------------------------------------------------- //
    async endMatch(data: EndMatchData): Promise<{ success: boolean, message?: string }> {
        try {
            const match = await this.matchService.getMatch(data.matchId);
            if (!match) {
                return { success: false, message: `Match with id ${data.matchId} not found` };
            }

            // verifier que les donnees du match correspondent a celles enregistrees
            // (par ex: les joueurs correspondent bien)
            // sinon, renvoyer une erreur
            const validData = this.validDataMatch(data, match);
            if (!validData.success) {
                return { success: false, message: validData.message };
            }

            await this.matchService.endMatch(validData, match);

            if (match.tournamentId) {
                await this.tournamentService.updateMatchResult(match.tournamentId, match.id);
            }

            return { success: true };
        }
        catch (error) {
            console.warn(error);
            return { success: false, message: "An error occurred when fetching the database" };
        }
    }

    // registration of the match only remote call
    // functions will be call by other controller or services
    // =================================== PUBLIC ==================================== //
	// --------------------------------------------------------------------------------- //
	async register(matchData: MatchData): Promise<{success: Boolean, message?: string}>
	{
        try {
            const loser = await this.checkMatchData(matchData.loserLevel, matchData.loserId);
            matchData.loserId = loser.id;
            matchData.loserLevel = loser.level;
    
            const winner = await this.checkMatchData(matchData.winnerLevel, matchData.winnerId);
            matchData.winnerId = winner.id;
            matchData.winnerLevel = winner.level;
    
            await this.matchService.registerMatch(matchData);

			if (matchData.loserId) {
				const loserStats = await this.matchService.getStat(matchData.loserId);
				if (loserStats.stats) {
					SocketEventController.sendToUser(matchData.loserId, 'game-stats-update', { stats: loserStats.stats });
				}		
			}

			if (matchData.winnerId) {
				const winnerStats = await this.matchService.getStat(matchData.winnerId);
				if (winnerStats.stats) {
					SocketEventController.sendToUser(matchData.winnerId, 'game-stats-update', { stats: winnerStats.stats });
				}
			}
    
            return { success: true };            
        }
        catch (error) {
            if (error instanceof MatchException)
                return { success: false, message: error?.message || "An error occurred during the recording of the match." };

			console.warn(error);

			return { success: false, message: "An error occurred when fetching the database" };
        }
	}

	// ----------------------------------------------------------------------------- //
	// async getStats(ids: number[]) : Promise<{ success: boolean, message?: string, stats?: GameStats[] }> {
	// 	try {
	// 		// verification pathern
	// 		const zodParsing = CommonSchema.Ids.safeParse(ids);
	// 		if (!zodParsing.success)
	// 			return { success: false, message: zodParsing.error?.issues?.[0]?.message || 'Error ids format' }
	
	// 		// duplication detection
	// 		const parsedIds = [...new Set(zodParsing.data)] ;
	// 		if (parsedIds.length !== ids.length)
	// 			return { success: false, message: 'Duplicate ids detected' }
			
	// 		// call db 
	// 		const stats = await this.matchService.getStats(parsedIds);
	// 		if (!stats.stats)
	// 			return { success: false, message: stats.message || 'Error retrieving stats'}
	
	// 		return {
	// 			success: true,
	// 			stats: stats.stats
	// 		};			
	// 	} catch (error) {
	// 		return {
	// 			success: false,
	// 			message: 'Error retrieving data from the database'
	// 		}
	// 	}
	// }
	
	// ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private async checkMatchData(level: string | undefined, id: number | undefined): Promise<{ id: number | undefined, level: string | undefined }>
    {
		if (level) {
            return {
                id: undefined,
                level: this.manageOpponent(level as OPPONENT_LEVEL),
            }
		}
		else if (id) {
            const user: User | null = await this.friendService.getById(Number(id));
            if(!user)
                throw new MatchException(MatchError.USR_NOT_FOUND, 'User with id ' + id.toString() + ' of the match not found');
            
            return {
                id: user.id,
                level: undefined,
            }
		}
        else
            throw new MatchException(MatchError.INVALID_OPPONENT, "No opponent define");
    }

    // --------------------------------------------------------------------------------- //
    private manageOpponent(level: OPPONENT_LEVEL): string
    {
        switch (level)
        {
            case OPPONENT_LEVEL.GUEST:
                return this.createAlias('Guest_');
            case OPPONENT_LEVEL.AI:
                return this.createAlias('AI_');;
            default:
                throw new MatchException(MatchError.INVALID_OPPONENT, 'Unknow opponent type');
        }
    }

    // --------------------------------------------------------------------------------- //
    private createAlias(level: string): string {
        return `${level}${randomUUID().split('-')[0]}`;
    }

    // =================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    /**
     * on doit s'assurer que les IDs des joueurs du match correspondent bien
     * si on a un ou des joueurs qui sont en Guest le winner ou loser id peut etre null et loser ou winner level non nul 
     */
    private validDataMatch(data: EndMatchData, match: Match): { success: boolean, message?: string } {
        // Normalisation des IDs pour la comparaison (Prisma utilise null, JS utilise undefined)
        const p1Id = match.player1Id ?? null;
        const p2Id = match.player2Id ?? null;
        const winnerId = data.winner.id ?? null;
        const loserId = data.loser.id ?? null;

        // On vérifie si l'un des deux scénarios valides est rencontré :
        // Scénario A : Player 1 a gagné, Player 2 a perdu
        const scenarioA = (p1Id === winnerId && p2Id === loserId);

        // Scénario B : Player 1 a perdu, Player 2 a gagné
        const scenarioB = (p1Id === loserId && p2Id === winnerId);

        if (scenarioA || scenarioB) {
            return { success: true };
        }

        return { 
            success: false, 
            message: 'Match data (winner/loser IDs) does not correspond to the registered match players' 
        };
    }
}
