import type { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentService } from '../services/TournamentService.js';
import type { MatchData } from '../types/match.types.js';
import { MatchService } from '../services/MatchService.js';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';


interface createTournament
{
    title: string;
    adminUserId: number;
    participants: {
        userId?: number; // optional with guest accounts
        alias: string;
    }[];
}

export class TournamentController {
	constructor(
        private tournamentService: TournamentService,
		private matchService: MatchService,
	) {}

    private tournamentLimit = 64; // max participants per tournament

    // ==================================== PUBLIC ==================================== //

    /**
     * a faire dans cette structure :
     * 
     * connaitre si il y a un nombre max de participants a un tournois
     * un seul mode (elimination directe) pour l'instant
     * 
     * l'enregistrement du tournois :
     * DATA FROM FRONT:
     *  -> le nom/titre du tournois
     *  -> userId de l'admin du tournois
     *  -> les profiles des participants
     *      . leur userId
     *      . leur alias dans le tournois
     * 
     * version simple pour verifier que les matchs du tournois qui sont joues et envoyes a la db ne sont pas corrompus :
     *      je tiens a jour une map dynamique avec pour chaque tournois une liste de joueurs en jeu et une liste de joueurs eliminies/forfes ( map<tournamentId, {ingamelist[], outgamelist[]}> )
     *      a chaque fin de match, je recoit le resultat du match et l'id du tournois
     *      je verifie que les joueurs qui ont joue le match sont bien dans la liste des joueurs en jeu
     *      je me a jour le tableau avec les gagnants et les perdants et je sauvegarde le match
     * 
     * 
     * version plus complexe:
     *      le front m'envoie la liste initiale des matchs qui vont se jouer
     *      je stocke cette liste dans une map dynamique avec pour clef l'id du tournois
     *      a chaque fin de match, je verifie que le match fait partie de la liste des matchs du tournois
     *      je sauvegarde le match et je mets a jour la liste des matchs du tournois
     * 
     * 
     * si un joueur participe a un tournois il ne peut pas participer a un autre tournois en meme temps
     * 
     * 
     * 
     *  la structure des tournois a verifier
     *      -> matchmaking donne deja la structure du tournois ?
     * 
     * les matchs qui correspondent a un tournois doivent respecter la structure
     * 
     * 
     * gerer le cas ou le tournois est annule
     *          - un tournois peut etre annule par son admin
     * 
     * les tournois et matchs locaux ne sont pas enregistres dans la db (eviter triche)
     * 
     * 
     * IDEES:
     * tenir un tableau dynamique de tournois a jour 
     *  une map avec un id de tournois en clef et une structure { participants: [], forfeit: [] }
     * 
     * 
     * 
     * 
     * comment se lancent les matchs ?
     * est ce qu'il y a un admin pour les match comme pour les tournois?
     * 
     * 
     */

    public async createTournament(data: createTournament) : Promise<number[]> {
        if (data.participants.length > this.tournamentLimit) {
            return [-1];
        }
        // this.tournamentService.createTournament(data);
        return  [0];
    }

	// ----------------------------------------------------------------------------- //
	async updateMatchResult(request: FastifyRequest<{Body: {tournamentId: number, matchData: MatchData} }>, reply: FastifyReply) {

		// le middleware checkGameSecret verifie deja le header x-game-secret
        try {
            const { tournamentId, matchData } = request.body;
			
            // does the tournament exist ?
            if (!(await this.tournamentService.validateTournament(tournamentId)))
                throw new TournamentException(TournamentError.INVALID_TOURNAMENT_ID, 'Tournament not found');
            
			// register the match
            const matchId = await this.matchService.registerTournamentMatch(matchData, tournamentId);
            
			// update the tournament with the match result
            await this.tournamentService.updateMatchResult(tournamentId, matchId);

        } catch (error) {
            if (error instanceof TournamentException)
                return reply.code(400).send({
                        success: false,
                        message: error?.message || error.code
                    })
            
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: "Internal server error",
            })
        }
		return;
	}
	
	// ----------------------------------------------------------------------------- //

	// ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //

}