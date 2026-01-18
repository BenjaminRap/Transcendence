import type { PrismaClient } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament } from '../types/tournament.types.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient,
	) {}

	private tournamentLimit = 64; // max participants per tournament
	// ==================================== PUBLIC ==================================== //
	// ----------------------------------------------------------------------------- //


	// ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //


	async createTournament(data: CreateTournament) {
		if (data.participants.length > this.tournamentLimit) {
			throw new TournamentException(TournamentError.TOURNAMENT_LIMIT_EXCEEDED);
		}

		const tournament = await this.prisma.tournament.create({
			data: {
				title: data.title,
				maxParticipants: 64,
				status: 'ONGOING',
				creatorId: adminUserId,
				participants: {
					create: participants.map(participant => ({
						alias: participant.alias,
						userId: participant.userId,
					})),
				},
			},
		});

		return tournament;
	}

	async getTournamentById(tournamentId: number) {
		const tournament = await this.prisma.tournament.findUnique({
			where: { id: tournamentId },
			include: {
				participants: true,
				matches: true,
			},
		});

		if (!tournament) {
			throw new TournamentException('Tournament not found.');
		}

		return tournament;
	}

	async updateTournamentStatus(tournamentId: number, status: string) {
		const tournament = await this.prisma.tournament.update({
			where: { id: tournamentId },
			data: { status },
		});

		return tournament;
	}

	async addParticipant(tournamentId: number, participant: { userId?: number; alias: string; }) {
		const tournament = await this.getTournamentById(tournamentId);

		if (tournament.participants.length >= tournament.maxParticipants) {
			throw new TournamentException('Tournament is full.');
		}

		const newParticipant = await this.prisma.tournamentParticipant.create({
			data: {
				alias: participant.alias,
				userId: participant.userId,
				tournamentId,
			},
		});

		return newParticipant;
	}

	async removeParticipant(tournamentId: number, participantId: number) {
		const participant = await this.prisma.tournamentParticipant.delete({
			where: { id: participantId },
		});

		return participant;
	}

	async finishTournament(tournamentId: number) {
		const tournament = await this.updateTournamentStatus(tournamentId, 'FINISHED');
		return tournament;
	}
}