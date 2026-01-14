import type { FastifyRequest, FastifyReply } from 'fastify';
import { MatchService } from '../services/MatchService.js';
import { CommonSchema } from '../schemas/common.schema.js';
import { type GameStats, type MatchData, OPPONENT_LEVEL } from '../types/match.types.js';
import { MatchException, MatchError } from '../error_handlers/Match.error.js';
import { FriendService } from '../services/FriendService.js';
import { SocketEventController } from './SocketEventController.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
		private friendService: FriendService,
	) {}

	// ----------------------------------------------------------------------------- //
	// /api/match/register
	async registerMatch(request: FastifyRequest<{ Body: MatchData }>, reply: FastifyReply): Promise<{ message?: string }> {
		// the middleware checkGameSecret already checks the x-game-secret header
        const ret = await this.register(request.body);

        if (!ret.success) {
            return reply.code(409).send({
                message: ret?.message || "An error occurred during the registration of the match.",
            })
        }

        return reply.code(201);
	}

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
				return { success: false, message: stats.message || 'Error retrieving stats'}
	
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
            const user = await this.friendService.getById(Number(id));
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
