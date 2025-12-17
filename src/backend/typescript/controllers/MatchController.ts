import { FastifyRequest, FastifyReply } from 'fastify';
import { MatchService } from '../services/MatchService.js';
import { CommonSchema } from '../schemas/common.schema.js';
import { GameStats, MatchData, OPPONENT_LEVEL } from '../types/match.types.js';
import { MatchException, MatchError } from '../error_handlers/Match.error.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
	) {}

    // 
	// ----------------------------------------------------------------------------- //
	async startMatch(matchData: MatchData): Promise<{ success: boolean, message?: string }> {
        // proteger cette route pour qu'elle ne soit accessible que par le backend de ben

        try {
            if (matchData.loserLevel) {
                matchData.loserId = null;
                matchData.loserLevel = this.manageOpponent(matchData.loserLevel as OPPONENT_LEVEL);
            }
            else {
                matchData.loserLevel = undefined;
                /**
                 * verifier que l'user existe en base de donnees
                 * leve une erreur si l'user n'existe pas
                 * assigner le bon id
                 */
                
            }
            if (this.isOpponentLevel(matchData.winnerId))
                matchData.winnerId = this.manageOpponent(matchData.winnerId as OPPONENT_LEVEL);


            if (matchData.tournamentId) {
                console.log("");//manage;
                /**
                 * mettre a jour les datas dans la table tournois
                 * leve une erreur si le tournois n'existe pas
                 *  
                */ 
            }


            
            return { success: true };
            
        } catch (error) {
            if (error instanceof MatchException)
            {
                switch (error.code)
                {
                    case MatchError.USR_NOT_FOUND:
                        console.log("User not found");
                        break;
                    case MatchError.INVALID_OPPONENT:
                        console.log("Invalid opponent");
                        break;
                }
                return { success: false };
            }

            
        }
	}

	// ----------------------------------------------------------------------------- //
	async getStats(ids: number[]) : Promise<{ success: boolean, message?: string, stats?: GameStats[] }> {
		try {
			// verification pathern
			const zodParsing = CommonSchema.Ids.safeParse(ids);
			if (!zodParsing.success)
				return { success: false, message: zodParsing.error?.issues?.[0]?.message || 'Error ids format' }
	
			// duplication detection
			const parsedIds = [...new Set(zodParsing.data)] ;
			if (parsedIds.length !== ids.length)
				return { success: false, message: 'Duplicate ids detected' }
			
			// call db 
			const stats = await this.matchService.getStats(parsedIds);
			if (!stats.stats)
				return { success: false, message: stats.message || 'Error retrieving statistics'}
	
			return {
				success: true,
				stats: stats.stats
			};			
		} catch (error) {
			return {
				success: false,
				message: 'Error retrieving data from the database'
			}
		}
	}

	// ----------------------------------------------------------------------------- //
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

    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private isOpponentLevel(data: any): data is OPPONENT_LEVEL {
        return Object.values(OPPONENT_LEVEL).includes(data as OPPONENT_LEVEL);
    }

    // --------------------------------------------------------------------------------- //
    private manageOpponent(level: OPPONENT_LEVEL): string
    {
        switch (level)
        {
            case OPPONENT_LEVEL.GUEST:
                return this.createGuestAlias();
            case OPPONENT_LEVEL.AI_EASY:
            case OPPONENT_LEVEL.AI_MEDIUM:
            case OPPONENT_LEVEL.AI_HARD:
                return level as string;
            default:
                throw new MatchException(MatchError.INVALID_OPPONENT, 'Unknow opponent type');
        }
    }

    // --------------------------------------------------------------------------------- //
    private createGuestAlias(): string {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = 'Guest_';
        
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

}
