import { type PrismaClient } from '@prisma/client';
import { FriendService } from './FriendService.js';
import type { GameStats } from '@shared/ZodMessageType.js';
import type { MatchData, MatchSummary, OpponentSummary, PlayerInfo } from '../types/match.types.js';


export class MatchService {
	constructor(
		private prisma: PrismaClient,
        private friendService: FriendService,
	) {}

    // =================================== PUBLIC ==================================== //

	// ----------------------------------------------------------------------------- //
    async registerMatch(match: MatchData): Promise<number | null> {
        const data = {
            playerLeftId: match.leftId ?? null,
            playerLeftGuestName: match.leftGuestName,

            playerRightId: match.rightId ?? null,
            playerRightGuestName: match.rightGuestName,

            winnerIndicator: match.winnerIndicator,

            scoreLeft: match.scoreLeft,
            scoreRight: match.scoreRight,
            duration: match.duration,
        }

        const newmatch = await this.prisma.match.create({
            data: data
        });

        return newmatch ? newmatch.id : null;

    }

    // ----------------------------------------------------------------------------- //
    async registerTournamentMatch(tournamentId: number, match: MatchData)
    {
        const data = {
            playerLeftId: match.leftId ?? null,
            playerLeftGuestName: match.leftGuestName,

            playerRightId: match.rightId ?? null,
            playerRightGuestName: match.rightGuestName,

            winnerIndicator: match.winnerIndicator,

            scoreLeft: match.scoreLeft,
            scoreRight: match.scoreRight,
            duration: match.duration,

            tournamentId: tournamentId,
        }

        const newmatch = await this.prisma.match.create({
            data: data
        });

        return newmatch ? newmatch.id : null;
    }

    // ----------------------------------------------------------------------------- //
    async getLastMatches(userId: number, limit: number): Promise<MatchSummary[]>
    {
            const matchs = await this.prisma.match.findMany({ 
            where: {
                playerLeftId: Number(userId),
            },
            select: {
                winnerIndicator: true,
                playerRight: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                playerLeft: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: Number(limit),
        });

        return await this.formatMatchSummary(matchs, userId);
    }

	// ----------------------------------------------------------------------------- //
 	async getStat(playerId: number): Promise<GameStats> {
        const wins = await this.countMatchAs(playerId, 'left');

        const lose = await this.countMatchAs(playerId, 'right');

        return this.calculateStats(wins, lose);
    }

	// ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
	private async formatMatchSummary(matchs: any[], userId: number): Promise<MatchSummary[]> {
        return await Promise.all(matchs.map(async (m) => {
            const isUserLeft = m.leftId === userId;
            const opponentPlayer = isUserLeft ? m.right : m.left;
            const opponentId = opponentPlayer?.id;

            const isWinner = (isUserLeft && m.winnerIndicator === 'left') || (!isUserLeft && m.winnerIndicator === 'right');

            const opponent: OpponentSummary = {
                id: opponentId,
                username: opponentPlayer?.username ?? (isUserLeft ? m.rightGuestName : m.leftGuestName),
                avatar: opponentPlayer?.avatar ?? null,
                isFriend: opponentId ? await this.friendService.areFriends(userId, opponentId) : false,
            };

            const winnerScore = m.winnerIndicator === 'left' ? m.scoreLeft : m.scoreRight;
            const loserScore = m.winnerIndicator === 'left' ? m.scoreRight : m.scoreLeft;

            const winner = m.winnerIndicator === 'left' ? (m.left ?? { username: m.leftGuestName }) : (m.right ?? { username: m.rightGuestName });
            const loser = m.winnerIndicator === 'left' ? (m.right ?? { username: m.rightGuestName }) : (m.left ?? { username: m.leftGuestName });

            return {
                opponent,
                isWinner,
                matchResult: {
                    matchId: m.id,
                    scoreWinner: winnerScore,
                    scoreLoser: loserScore,
                    duration: m.duration,
                    winnerName: winner.username,
                    loserName: loser.username,
                },
            };
        }));
    }
    
    // ----------------------------------------------------------------------------- //
    private async countMatchAs(id: number, indic: string): Promise<number> {
        try {
            const left = await this.prisma.match.count({
                where: { playerLeftId: id, winnerIndicator: indic },
            });
    
            const other = indic === 'left' ? 'right' : 'left';
    
            const right = await this.prisma.match.count({
                where: { playerRightId: id, winnerIndicator: other }
            });
            return left + right;
            
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

	// ----------------------------------------------------------------------------- //
	private async isExisting(id: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id: Number(id) },
			select: { id: true }
		});
		return user !== null;
	}

    // --------------------------------------- -------------------------------------- //
    private calculateStats(matchesWons: number, matchesLoses: number): GameStats {
        const totalMatches = matchesWons + matchesLoses;
        const ratio = totalMatches > 0 ? (matchesWons / totalMatches * 100).toFixed(2) : "0.00";

        return {
            wins: matchesWons,
            losses: matchesLoses,
            total: totalMatches,
            winRate: parseFloat(ratio),
        };
    }
}
