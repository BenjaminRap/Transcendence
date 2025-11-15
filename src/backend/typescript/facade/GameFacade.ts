import { MatchController } from "../controllers/MatchController.js";

export class GameFacade {
	constructor(
		private matchController: MatchController,
	) {}
	
	// ----------------------------------------------------------------------------- //
	// GET /gamefacade/stats
	async getStats(userId: number) {
		// call MatchController to get stats
		// return this.matchController.getStats(userId);
	}

}