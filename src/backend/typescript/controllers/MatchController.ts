import { MatchService } from '../services/MatchService.js';
import { CommonSchema } from '../schemas/common.schema.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
	) {}

	// ----------------------------------------------------------------------------- //
	/*
		la fonction suivante getStats doit prendre en parametre un tableau de payerId
		elle doit verifier tous les id en parametre pour voir qu'ils respectent ce schema zod:
			id: z.number()
				.int()
				.min(1)
				.max(2147483647),
		puis appeler la fonction getStats de MatchService qui fera les callDb
		
		ma question est de savoir comment optimiser le mieux les appels db (avec prisma)
		est il mieux de boucler sur tous les id et appeler MatchService sur chacun d'entre eux et stocker leurs resultats dans le controller ?
		ou bien on peut envoyer tous les ids au service qui pourra faire un seul appel a la db avec prisma pour obtenir en une fois les stats de tous les players (si c'est possible)
		ou tout autre solution viable
	*/
	async getStats(ids: number[]) {
		
	}

}