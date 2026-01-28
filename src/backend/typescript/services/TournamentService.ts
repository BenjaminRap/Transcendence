import { type PrismaClient, type Tournament, TournamentStatus } from '@prisma/client';
import type { CreateTournament, Ranking } from '../types/tournament.types.js';

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
                creatorId: data.creatorId ?? null,
                creatorGuestName: data.creatorGuestName,
                participants: {
                    create: data.participants,
                },
            },
        });
        return tournament?.id;
    }

	// ----------------------------------------------------------------------------- //
	async getTournamentById(tournamentId: number): Promise<Tournament | null> {
		return await this.prisma.tournament.findUnique({
			where: { id: Number(tournamentId) },
			include: {
				participants: true,
				matches: true,
			},
		});
	}

	// ----------------------------------------------------------------------------- //
	private async updateTournamentStatus(tournamentId: number, status: TournamentStatus): Promise<Tournament> {
		return await this.prisma.tournament.update({
			where: { id: Number(tournamentId) },
			data: { status },
		});
	}

	// ----------------------------------------------------------------------------- //
	async finishTournament(tournamentId: number, ranking: Ranking[]): Promise<Tournament> {
        // update ranking for each participant
        for (const r of ranking) {
            await this.prisma.tournamentParticipant.updateMany({
                where: {
                    tournamentId: Number(tournamentId),
                    alias: r.alias,
                },
                data: {
                    finalRank: r.rank,
                },
            });
        }
        
        return await this.updateTournamentStatus(tournamentId, TournamentStatus.FINISHED);
	}
}
