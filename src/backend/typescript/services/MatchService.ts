import type { PrismaClient, Match } from '@prisma/client';
import type { GameStats, EndMatchData, MatchResult } from '../types/match.types.js';
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
                player1Level: player1.level ?? null,
                player2Id: player2.id ?? null,
                player2Level: player2.level ?? null,
            }
        });

        return match.id
    }

	// ----------------------------------------------------------------------------- //
    async endMatch(matchData: EndMatchData): Promise<void> {
        await this.prisma.match.update({
            where: { id: matchData.matchId as number },
            data: {
                status: 'FINISHED',

                winnerId: matchData.winner.id ?? null,
                winnerLevel: matchData.winner.level ?? null,

                loserId: matchData.loser.id ?? null,
                loserLevel: matchData.loser.level ?? null,
                
                scoreWinner: matchData.scoreWinner as number,
                scoreLoser: matchData.scoreLoser as number,

                duration: matchData.duration,
            }
        });
    }

	// ----------------------------------------------------------------------------- //
	async getMatchInProgress(matchId: number): Promise<Match | null> {
        return this.prisma.match.findFirst({
            where: {
                id: matchId,
                status: 'IN_PROGRESS'
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
            const opponentLevel = isUserWinner ? match.loserLevel : match.winnerLevel;

            let opponentSummary: OpponentSummary;

            if (opponentUser) {
                // if user exists in DB
                opponentSummary = {
                    id: opponentUser.id.toString(),
                    username: opponentUser.username,
                    avatar: opponentUser.avatar,
                    isFriend: await this.friendService.isFriend(userId, opponentUser.id)
                };
            } else if (opponentLevel) {
                // if opponent is a guest or AI
                opponentSummary = {
                    id: "GUEST",
                    username: opponentLevel,
                    avatar: process.env.DEFAULT_AVATAR_URL || "https://8080:localhost/api//static/public/avatarDefault.webp", 
                    isFriend: false
                };
            } else {
                // if user has deleted their account (neither User nor Level if it was a real user before)
                opponentSummary = {
                    id: "DELETED",
                    username: "Deleted User",
                    avatar: process.env.DEFAULT_AVATAR_URL || "https://8080:localhost/api//static/public/avatarDefault.webp",
                    isFriend: false
                };
            }

            return {
                opponent: opponentSummary,
                match: match as MatchResult,
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
