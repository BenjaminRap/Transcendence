import { type PrismaClient, TournamentStatus } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament } from '../types/tournament.types.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient
	) {}

    // ----------------------------------------------------------------------------- //
    async createTournament(data: CreateTournament): Promise<number | null> {
        const tournament = await this.prisma.tournament.create({
            data: {
                title: data.title,
                status: TournamentStatus.ONGOING,
                creatorId: data.creatorId || null,
                creatorGuestName: data.guestName,
                participants: {
                    create: data.participants,
                },
            },
        });
        return tournament.id;
    }

	// ----------------------------------------------------------------------------- //
	async getTournamentById(tournamentId: number) {
		const tournament = await this.prisma.tournament.findUnique({
			where: { id: Number(tournamentId) },
			include: {
				participants: true,
				matches: true,
			},
		});

		if (!tournament) {
			throw new TournamentException(TournamentError.TOURNAMENT_NOT_FOUND);
		}

		return tournament;
	}

	// ----------------------------------------------------------------------------- //
	private async updateTournamentStatus(tournamentId: number, status: TournamentStatus) {
		const tournament = await this.prisma.tournament.update({
			where: { id: Number(tournamentId) },
			data: { status },
		});
		return tournament;
	}

	// ----------------------------------------------------------------------------- //
	async finishTournament(tournamentId: number, ranking: { PlayerAlias: string, rank: number }[]) {
        // update ranking for each participant
        for (const r of ranking) {
            await this.prisma.tournamentParticipant.updateMany({
                where: {
                    tournamentId: Number(tournamentId),
                    alias: r.PlayerAlias,
                },
                data: {
                    finalRank: r.rank,
                },
            });
        }
        
        const tournament = await this.updateTournamentStatus(tournamentId, TournamentStatus.FINISHED);
		return tournament;
	}

	// ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId: number, adminId: number | null, adminGuestName: string) {
        const tournament = await this.getTournamentById(tournamentId);

        if (tournament.status === TournamentStatus.FINISHED || tournament.status === TournamentStatus.CANCELLED) {
             return tournament;
        }

        const isCreator = (tournament.creatorId === adminId) &&
                          (tournament.creatorGuestName === adminGuestName);

        if (!isCreator)
            throw new TournamentException(TournamentError.UNAUTHORIZED);

        return await this.updateTournamentStatus(tournamentId, TournamentStatus.CANCELLED);
    }

}