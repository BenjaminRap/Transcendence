import { FastifyRequest, FastifyReply } from 'fastify';
import { MatchService } from '../services/MatchService.js';
import { CommonSchema } from '../schemas/common.schema.js';
import { GameStats, MatchHistoryEntry } from '../types/match.types.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
	) {}

	// ----------------------------------------------------------------------------- //
	async startMatch(ids: number[]): Promise<{ success: boolean, message?: string, matchId?: number }> {
		// cree une nouvelle instance dans la db, je dois savoir combien de participants par matchs

		
		return { success: true };
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
}
