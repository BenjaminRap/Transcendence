import { type PrismaClient, type Match, MatchStatus } from '@prisma/client';
import type { GameStats, EndMatchData } from '../types/match.types.js';
import type { PlayerInfo } from '../types/match.types.js';
import type { MatchSummary, OpponentSummary } from '../types/match.types.js';
import { FriendService } from './FriendService.js';

export class MatchService {
	constructor(
		private prisma: PrismaClient,
        private friendService: FriendService,
	) {}
    
	// ----------------------------------------------------------------------------- //
    async startMatch(player1: PlayerInfo, player2: PlayerInfo): Promise<number> {
        const match = await this.prisma.match.create({
            data: {
                player1Id: player1.id ?? null,
                player1GuestName: player1.guestName,
                player2Id: player2.id ?? null,
                player2GuestName: player2.guestName,
            }
        });

        return match.id
    }

	// ----------------------------------------------------------------------------- //
    async endMatch(matchData: EndMatchData): Promise<void> {
        await this.prisma.match.update({
            where: { id: matchData.matchId as number },
            data: {
                status: MatchStatus.FINISHED,

                winnerId: matchData.winner.id ?? null,
                winnerGuestName: matchData.winner.guestName,

                loserId: matchData.loser.id ?? null,
                loserGuestName: matchData.loser.guestName,
                
                scoreWinner: Number(matchData.scoreWinner),
                scoreLoser: Number(matchData.scoreLoser),

                duration: matchData.duration,
            }
        });
    }

	// ----------------------------------------------------------------------------- //
    async getTournamentMatch(tournamentId: number, matchData: EndMatchData): Promise<Match | null> {
        return await this.prisma.match.findFirst({
            where: {
                id: matchData.matchId,
                tournamentId: tournamentId,
                OR: [
                    {
                        player1GuestName: matchData.winner.guestName,
                        player2GuestName: matchData.loser.guestName
                    },
                    {
                        player1GuestName: matchData.loser.guestName,
                        player2GuestName: matchData.winner.guestName
                    }
                ]
            }
        });
    }

	// ----------------------------------------------------------------------------- //
	async getMatchInProgress(matchId: number): Promise<Match | null> {
        return this.prisma.match.findFirst({
            where: {
                id: matchId,
                status: MatchStatus.IN_PROGRESS
            }
        });
    }

    // --------------------------------------- -------------------------------------- //
    calculateStats(matchesWons: number, matchesLoses: number): GameStats {
        const totalMatches = matchesWons + matchesLoses;
        const ratio = totalMatches > 0 ? (matchesWons / totalMatches * 100).toFixed(2) : "0.00";

        return {
            wins: matchesWons,
            losses: matchesLoses,
            total: totalMatches,
            winRate: parseFloat(ratio),
        };
    }

    // ----------------------------------------------------------------------------- //
    async getLastMatches(userId: number, matchesWons: any[], matchesLoses: any[], limit: number): Promise<MatchSummary[]> {

        const allMatches = [
            ...(matchesWons || []),
            ...(matchesLoses || []),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

        return Promise.all(allMatches.map(async match => {
            
            const isUserWinner = match.winnerId === userId;
            
            const opponentUser = isUserWinner ? match.loser : match.winner;
            const opponentGuestName = isUserWinner ? match.loserGuestName : match.winnerGuestName;

            let opponentSummary: OpponentSummary;

            if (opponentUser) {
                // if user exists in DB
                opponentSummary = {
                    id: Number(opponentUser.id),
                    username: opponentUser.username,
                    avatar: opponentUser.avatar,
                    isFriend: await this.friendService.isFriend(userId, Number(opponentUser.id))
                };
            }else {
                // opponent is guest or AI
                opponentSummary = {
                    id: undefined,
                    username: opponentGuestName,
                    avatar: process.env.DEFAULT_AVATAR_URL || "http://localhost:8181/static/public/avatarDefault.webp",
                    isFriend: false
                };
            }

            return {
                opponent: opponentSummary,
                matchResult: {
                    matchId: match.id,
                    scoreWinner: match.scoreWinner,
                    scoreLoser: match.scoreLoser,
                    duration: match.duration,
                    winner: {
                        id: match.winnerId ?? undefined,
                        guestName: match.winnerGuestName,
                    } as PlayerInfo,
                    loser: {
                        id: match.loserId ?? undefined,
                        guestName: match.loserGuestName,
                    } as PlayerInfo,
                },
            } as MatchSummary;
        }));
    }

	// ----------------------------------------------------------------------------- //
	async getStats(playerIds: number[]): Promise<{stats: GameStats[] | null, message?: string }> {
		if (!await this.theyExist(playerIds))
			return { stats: null, message: 'One or more players do not exist' }

		const wins = await this.prisma.match.groupBy({
			by: ['winnerId'],
			where: { winnerId: { in: playerIds } },
			_count: true
		});

		const losses = await this.prisma.match.groupBy({
			by: ['loserId'],
			where: { loserId: { in: playerIds } },
			_count: true
		});
        
		const stats = playerIds.map(id => {
			const won = wins.find(w => w.winnerId === id)?._count ?? 0;
			const lost = losses.find(l => l.loserId === id)?._count ?? 0;

			return this.calculateStats(won, lost);;
		});
		return { stats }
	}

	// ----------------------------------------------------------------------------- //
 	async getStat(playerId: number): Promise<{stats: GameStats | null, message?: string }> {
        if (!await this.isExisting(playerId))
            return { stats: null, message: 'Player does not exist' }

        const wins = await this.prisma.match.count({
            where: { winnerId: playerId }
        });

        const losses = await this.prisma.match.count({
            where: { loserId: playerId }
        });

        const stats: GameStats = this.calculateStats(wins, losses);

        return { stats };
    }

	// ----------------------------------------------------------------------------- //
	async startTournamentMatch(tournamentId: number, round: number, matchOrder: number, player1: PlayerInfo, player2: PlayerInfo) {
        return this.prisma.match.create({
            data: {
                tournamentId,
                round,
                matchOrder,
                player1Id: player1.id ?? null,
                player1GuestName: player1.guestName,
                player2Id: player2.id ?? null,
                player2GuestName: player2.guestName,
                status: MatchStatus.IN_PROGRESS
            }
        });
    }

    // ----------------------------------------------------------------------------- //
    async createBracketMatch(tournamentId: number, round: number, matchOrder: number) {
        return this.prisma.match.create({
            data: {
                tournamentId,
                round,
                matchOrder,
                status: MatchStatus.IN_PROGRESS
            }
        });
    }

	// ================================== PRIVATE ================================== //

	// ----------------------------------------------------------------------------- //
	private async theyExist(ids: number[]): Promise<boolean> {
		const existingUsers = await this.prisma.user.findMany({
			where: { id: { in: ids } },
			select: { id: true }
		});

		const existingIds = existingUsers.map(u => u.id);

		const missingIds = ids.filter(ids => !existingIds.includes(ids));

		if (missingIds.length > 0)
			return false;
		return true;
	}

	// ----------------------------------------------------------------------------- //
	private async isExisting(id: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id: id },
			select: { id: true }
		});
		return user !== null;
	}
}
