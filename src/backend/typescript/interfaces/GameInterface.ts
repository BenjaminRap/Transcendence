import { MatchController } from "../controllers/MatchController.js";
import type { GameStats } from "../types/match.types.js";

// export class GameInterface {
// 	constructor(
// 		private matchController: MatchController,
// 	) {}
	
// 	// ----------------------------------------------------------------------------- //
// 	async startMatch(ids: number[]): Promise<{ success: boolean, message?: string, matchId?: number}> {
// 		// if (!this.ddosCheck(ids))
// 		// 	return { success: false, message: 'Too much ids' };

// 		// const result = await this.matchController.startMatch(ids);
// 		// if (!result.success)
// 		// 	return { success: false, message: result.message };

// 		return { success: true };

// 	}

// 	// ----------------------------------------------------------------------------- //
// 	async getStats(ids: number[]): Promise<{ success: boolean, message?: string, stats?: GameStats[]}> {
// 		if (!this.ddosCheck(ids))
// 			return { success: false, message: 'Too much ids' };
		
// 		// call MatchController to get stats
// 		const result = await this.matchController.getStats(ids);
// 		if (!result.success)
// 			return { success: false, message: result.message };
		
// 		return { success: true, stats: result.stats }
// 	}

//     // ==================================== PRIVATE ==================================== //

// 	// ----------------------------------------------------------------------------- //
// 	private ddosCheck(ids: number[]): boolean {
// 		if (ids.length > 200)
// 			return false;
// 		return true;
// 	}
// }
