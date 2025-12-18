import { FastifyRequest, FastifyReply } from 'fastify';
import { MatchService } from '../services/MatchService.js';
import { CommonSchema } from '../schemas/common.schema.js';
import { GameStats, MatchData, OPPONENT_LEVEL } from '../types/match.types.js';
import { MatchException, MatchError } from '../error_handlers/Match.error.js';
import { FriendService } from '../services/FriendService.js';
import { TournamentService } from '../services/TournamentService.js';
import { TournamentException } from '../error_handlers/Tournament.error.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
		private friendService: FriendService,
		private tournamentService: TournamentService
	) {}

	// ----------------------------------------------------------------------------- //
	async registerMatch(request: FastifyRequest<{ Body: MatchData }>, reply: FastifyReply): Promise<{ success: boolean, message?: string }> {
        // proteger cette route pour qu'elle ne soit accessible que par le backend de ben		
        try {
			this.register(request.body);
            
            return { success: true };
            
        } catch (error) {
            if (error instanceof MatchException)
            {
                switch (error.code)
                {
                    case MatchError.USR_NOT_FOUND:
						return { success: false, message: error?.message || "User not found" };
					case MatchError.INVALID_OPPONENT:
						return { success: false, message: error?.message || "Invalid opponent type" };
                }
            }

			return { success: false, message: "An error occurred during the recording of the match." }
            
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
	
	// --------------------------------------------------------------------------------- //
	async register(matchData: MatchData): Promise<{success: Boolean, message?: string}>
	{
		let loser, winner;
		if (matchData.loserLevel) {
			matchData.loserId = undefined;
			matchData.loserLevel = this.manageOpponent(matchData.loserLevel as OPPONENT_LEVEL);
		}
		else {
			matchData.loserLevel = undefined;
			loser = await this.friendService.getById(Number(matchData.loserId));
			if (!loser)
				throw new MatchException(MatchError.USR_NOT_FOUND, 'Loser of the match not found');
		}
		if (matchData.winnerLevel) {
			matchData.winnerId = undefined;
			matchData.winnerLevel = this.manageOpponent(matchData.winnerLevel as OPPONENT_LEVEL);
		}
		else {
			matchData.winnerLevel = undefined;
			winner = await this.friendService.getById(Number(matchData.winnerId));
			if (!winner)
				throw new MatchException(MatchError.USR_NOT_FOUND, 'winner of the match not found');
		}
		const matchId = await this.matchService.registerMatch(matchData);

		if (matchData.tournamentId)
		{
			try {
				await this.tournamentService.updateMatchResult(matchData.tournamentId, matchId);
				
			} catch (error) {
				if (error instanceof TournamentException) {
					// throw new MatchException(MatchError.INVALID_TOURNAMENT, );
					return { success: false, message: error.message || "Tournament error" };
				}
				return {
					success: false,
					message: 'Error updating tournament with match result'
				};
			}
		}
		return { success: true };
	}

    // ==================================== PRIVATE ==================================== //
	
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
