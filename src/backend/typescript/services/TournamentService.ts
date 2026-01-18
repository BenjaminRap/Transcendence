import type { PrismaClient } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament, TournamentState, PlayerInfo } from '../types/tournament.types.js';
import { MatchService } from './MatchService.js';
import type { EndMatchData } from '../types/match.types.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient,
        private matchService: MatchService,
	) {}

    // ----------------------------------------------------------------------------- //
	async createTournament(data: CreateTournament): Promise<TournamentState> {
        // Create Tournament
        const participants = data.participants.map(participant => ({
						alias: participant.alias,
						userId: participant.userId ?? null,
                        guestName: participant.userGuestName
					}))

		const tournament = await this.prisma.tournament.create({
			data: {
				title: data.title,
				status: 'ONGOING',
				creatorId: data.adminUserId ?? null,
                creatorGuestName: data.adminGuestName,
				participants: {
					create: participants,
				},
			} as any,
		});

        // Generate Bracket & Start Initial Matches
        
        // We create ALL matches for the bracket structure now to have IDs
        const matchesCreated: any[] = [];

        // Round 1
        for (let i = 0; i < data.matchups.length; i++) {
            const matchup = data.matchups[i];
            const match = await this.matchService.startTournamentMatch(
                tournament.id,
                1,
                i,
                matchup.player1,
                matchup.player2
            );
            matchesCreated.push(match);
        }

        // Subsequent Rounds placeholders
        const count = participants.length;
        const totalRounds = Math.log2(count);

        let matchesInRound = count / 2;
        for (let round = 2; round <= totalRounds; round++) {
            matchesInRound /= 2;
            for (let i = 0; i < matchesInRound; i++) {
                 await this.prisma.match.create({
                    data: {
                        tournamentId: tournament.id,
                        round: round,
                        matchOrder: i,
                        status: 'IN_PROGRESS' 
                    } as any 
                });
            }
        }
        
        // Construct return state
        const playersState = data.participants.map(participant => {
             let currentMatchId = null;
             // Check in created matches (Round 1)
             for(const match of matchesCreated) {
                 if ((match.player1Id === participant.userId && match.player1GuestName === participant.userGuestName) ||
                     (match.player2Id === participant.userId && match.player2GuestName === participant.userGuestName)) {
                     currentMatchId = match.id;
                     break;
                 }
             }
             
             return {
                 participantAlias: participant.alias,
                 currentMatchId
             };
        });

		return {
            tournamentId: tournament.id,
            players: playersState
        };
	}

	// ----------------------------------------------------------------------------- //
	async getTournamentById(tournamentId: number) {
		const tournament = await this.prisma.tournament.findUnique({
			where: { id: tournamentId },
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
    async updateTournamentProgress(tournamentId: number, matchData: EndMatchData) {
        const match = await this.prisma.match.findUnique({ where: { id: matchData.matchId } });
        if (!match || match.tournamentId !== tournamentId) {
            throw new TournamentException(TournamentError.MATCH_NOT_FOUND);
        }
        
        await this.matchService.endMatch(matchData);

        // Determine next match
        // Using 'any' to bypass TS check until schema regeneration
        const m: any = match; 
        if (!m.round || m.matchOrder === null || m.matchOrder === undefined) return; 

        const currentRound = m.round;
        const currentOrder = m.matchOrder;
        
        const nextRound = currentRound + 1;
        const nextMatchOrder = Math.floor(currentOrder / 2);
        const isPlayer1InNext = (currentOrder % 2 === 0);

        // Find next match
        const nextMatch = await this.prisma.match.findFirst({
            where: {
                tournamentId,
                round: nextRound,
                matchOrder: nextMatchOrder
            } as any
        });

        if (nextMatch) {
            const updateData: any = {};
            if (isPlayer1InNext) {
                updateData.player1Id = matchData.winner.id;
                updateData.player1GuestName = matchData.winner.guestName;
            } else {
                updateData.player2Id = matchData.winner.id;
                updateData.player2GuestName = matchData.winner.guestName;
            }
            await this.prisma.match.update({
                where: { id: nextMatch.id },
                data: updateData
            });
        } else {
            // Check for tournament finish
            const tournament = await this.getTournamentById(tournamentId);
            const totalParticipants = tournament.participants.length;
            const totalRounds = Math.log2(totalParticipants);
            
            if (currentRound === totalRounds) {
                await this.finishTournament(tournamentId);
            }
        }
    }
    
	// ----------------------------------------------------------------------------- //
    async startNextMatch(tournamentId: number, player1: PlayerInfo, player2: PlayerInfo) {
        const match = await this.prisma.match.findFirst({
            where: {
                tournamentId,
                status: 'IN_PROGRESS',
                OR: [
                    {
                        player1Id: player1.id,
                        player1GuestName: player1.guestName,
                        player2Id: player2.id,
                        player2GuestName: player2.guestName
                    },
                    {
                        player1Id: player2.id,
                        player1GuestName: player2.guestName,
                        player2Id: player1.id,
                        player2GuestName: player1.guestName
                    }
                ]
            } as any
        });
        
        if (!match)
            throw new TournamentException(TournamentError.MATCH_NOT_FOUND);
        return match;
    }

	// ----------------------------------------------------------------------------- //
	private async updateTournamentStatus(tournamentId: number, status: string) {
		const tournament = await this.prisma.tournament.update({
			where: { id: tournamentId },
			data: { status } as any,
		});
		return tournament;
	}

	// ----------------------------------------------------------------------------- //
	private async finishTournament(tournamentId: number) {
		const tournament = await this.updateTournamentStatus(tournamentId, 'FINISHED');
		return tournament;
	}

	// ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId: number, adminId: number | null, adminGuestName: string) {
        const tournament = await this.getTournamentById(tournamentId);

        const isCreator = (tournament.creatorId === adminId) ||
                          (tournament.creatorGuestName === adminGuestName);

        if (!isCreator)
            throw new TournamentException(TournamentError.UNAUTHORIZED);

        await this.prisma.match.updateMany({
            where: {
                tournamentId,
                status: 'IN_PROGRESS'
            } as any,
            data: {
                status: 'CANCELLED'
            } as any
        });

        // il faut peut etre reflechir aux matchs en cours
        // For now, we just set the tournament status to CANCELLED
        // TODO: Notify players in ongoing matches about cancellation

        return this.updateTournamentStatus(tournamentId, 'CANCELLED');
    }
}