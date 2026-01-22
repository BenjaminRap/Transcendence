import { type PrismaClient } from '@prisma/client';
import { FriendService } from './FriendService.js';
import type { GameStats } from '@shared/ServerMessage.js';
import type { MatchData, MatchSummary, OpponentSummary, PlayerInfo } from '../types/match.types.js';


export class MatchService {
	constructor(
		private prisma: PrismaClient,
        private friendService: FriendService,
	) {}

    // =================================== PUBLIC ==================================== //

	// ----------------------------------------------------------------------------- //
    async registerMatch(match: MatchData, winName: string, losName: string): Promise<number | null> {
        const data = {
            winnerId: typeof match.winner === "number" ? match.winner : null,
            winnerGuestName: winName,
            
            loserId: typeof match.loser === "number" ? match.loser : null,
            loserGuestName: losName,
            
            scoreWinner: match.scoreWinner,
            scoreLoser: match.scoreLoser,
            duration: match.duration,
        }

        const newmatch = await this.prisma.match.create({
            data: data
        });

        return newmatch ? newmatch.id : null;

    }

    // ----------------------------------------------------------------------------- //
    async registerTournamentMatch(tournamentId: number, match: MatchData, winName: string, losName: string)
    {
        const data = {
            tournamentId,

            winnerId: typeof match.winner === "number" ? match.winner : null,
            winnerGuestName: winName,

            loserId: typeof match.loser === "number" ? match.loser : null,
            loserGuestName: losName,

            scoreWinner: match.scoreWinner,
            scoreLoser: match.scoreLoser,
            duration: match.duration,
        }

        const newmatch = await this.prisma.match.create({
            data: data
        });

        return newmatch ? newmatch.id : null;
    }

    // --------------------------------------- -------------------------------------- //
    public calculateStats(matchesWons: number, matchesLoses: number): GameStats {
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

        return await Promise.all(allMatches.map(async match => {
            
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
                    avatar: process.env.DEFAULT_AVATAR_URL || "https://localhost:8080/api/static/public/avatarDefault.webp",
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
 	async getStat(playerId: number): Promise<{stats: GameStats | null, message?: string }> {
        if (!await this.isExisting(Number(playerId)))
            return { stats: null, message: 'Player does not exist' }

        const wins = await this.prisma.match.count({
            where: { winnerId: Number(playerId) }
        });

        const losses = await this.prisma.match.count({
            where: { loserId: Number(playerId) }
        });

        const stats: GameStats = this.calculateStats(wins, losses);

        return { stats };
    }

	// ================================== PRIVATE ================================== //

	// ----------------------------------------------------------------------------- //
	private async isExisting(id: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id: Number(id) },
			select: { id: true }
		});
		return user !== null;
	}
}
