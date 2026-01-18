import type { PrismaClient } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import type { CreateTournament, TournamentState, PlayerInfo } from '../types/tournament.types.js';
import { MatchService } from './MatchService.js';

export class TournamentService {
	constructor(
		private prisma: PrismaClient,
        private matchService: MatchService,
	) {}
    private tournamentLimitMin =  8;
	private tournamentLimitMax = 64;

    // ----------------------------------------------------------------------------- //
    

    // ----------------------------------------------------------------------------- //
	async createTournament(data: CreateTournament): Promise<TournamentState> {
        // Validation: Power of 2
        const count = data.participants.length;
        if (count < this.tournamentLimitMin || (count & (count - 1)) !== 0) {
            throw new TournamentException(TournamentError.INVALID_PARTICIPANT_COUNT);
        }
        if (data.participants.length > this.tournamentLimitMax) {
			throw new TournamentException(TournamentError.TOURNAMENT_LIMIT_EXCEEDED);
		}
        // Validation: Matchups length
        if (data.matchups.length !== count / 2) {
             throw new TournamentException(TournamentError.INVALID_MATCHUPS_COUNT);
        }
        
        // Create Tournament
		const tournament = await this.prisma.tournament.create({
			data: {
				title: data.title,
				maxParticipants: count,
				status: 'ONGOING',
				creatorId: data.adminUserId,
                creatorGuestName: data.adminGuestName,
				participants: {
					create: data.participants.map(participant => ({
						alias: participant.alias,
						userId: participant.userId,
                        guestName: participant.userGuestName
					})),
				},
			} as any,
		});

        // Generate Bracket & Start Initial Matches
        const totalRounds = Math.log2(count);
        
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
        let matchesInRound = count / 2;
        for (let r = 2; r <= totalRounds; r++) {
            matchesInRound /= 2;
            for (let i = 0; i < matchesInRound; i++) {
                 await this.prisma.match.create({
                    data: {
                        tournamentId: tournament.id,
                        round: r,
                        matchOrder: i,
                        status: 'IN_PROGRESS' 
                    } as any 
                });
            }
        }
        
        // Construct return state
        const playersState = data.participants.map(p => {
             let currentMatchId = null;
             // Check in created matches (Round 1)
             for(const m of matchesCreated) {
                 if ((m.player1Id === p.userId && m.player1GuestName === p.userGuestName) ||
                     (m.player2Id === p.userId && m.player2GuestName === p.userGuestName)) {
                     currentMatchId = m.id;
                     break;
                 }
             }
             
             return {
                 participantAlias: p.alias,
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
    async updateTournamentProgress(tournamentId: number, matchId: number, winnerId: number | null, winnerGuestName: string | null) {
        const match = await this.prisma.match.findUnique({ where: { id: matchId } });
        if (!match || match.tournamentId !== tournamentId) {
            throw new TournamentException(TournamentError.MATCH_NOT_FOUND);
        }
        
        // Update the match winner
        await this.prisma.match.update({
            where: { id: matchId },
            data: { 
                status: 'FINISHED',
                winnerId: winnerId,
                winnerGuestName: winnerGuestName
            } as any
        });

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
                updateData.player1Id = winnerId;
                updateData.player1GuestName = winnerGuestName;
            } else {
                updateData.player2Id = winnerId;
                updateData.player2GuestName = winnerGuestName;
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
        
        if (!match) throw new TournamentException(TournamentError.MATCH_NOT_FOUND);
        return match;
    }

	// ----------------------------------------------------------------------------- //
	async updateTournamentStatus(tournamentId: number, status: string) {
		const tournament = await this.prisma.tournament.update({
			where: { id: tournamentId },
			data: { status } as any,
		});
		return tournament;
	}

	// ----------------------------------------------------------------------------- //
	async finishTournament(tournamentId: number) {
		const tournament = await this.updateTournamentStatus(tournamentId, 'FINISHED');
		return tournament;
	}

	// ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId: number, adminId: number | string) {
        const tournament = await this.getTournamentById(tournamentId);
        
        const isCreator = (typeof adminId === 'number' && tournament.creatorId === adminId) || 
                          (typeof adminId === 'string' && (tournament as any).creatorGuestName === adminId);
        
        if (!isCreator) throw new TournamentException(TournamentError.UNAUTHORIZED);

        await this.prisma.match.updateMany({
            where: {
                tournamentId,
                status: 'IN_PROGRESS'
            } as any,
            data: {
                status: 'CANCELLED'
            } as any
        });

        return this.updateTournamentStatus(tournamentId, 'CANCELLED');
    }
}