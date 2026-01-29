import { Prisma, type Match, type PrismaClient } from '@prisma/client';
import { FriendService } from './FriendService.js';
import type { GameStats, MatchSummary, OpponentSummary } from '@shared/ZodMessageType.js';
import type { MatchData } from '../types/match.types.js';

export type MatchWithRelations = Prisma.MatchGetPayload<{
    include: {
        winnerIndicator: true,
        scoreLeft: true,
        scoreRight: true,
        duration: true,
        playerRight: true,
        playerLeft: true,
        playerRightGuestName: true,
        playerLeftGuestName: true,
        id: true,
        tournamentId: true,
        createdAt: true,
    }
}>;

export class MatchService {
	constructor(
		private prisma: PrismaClient,
        private friendService: FriendService,
	) {}

    // =================================== PUBLIC ==================================== //

	// ----------------------------------------------------------------------------- //
    async getFirstMAtch(match: Match): Promise<MatchWithRelations[]>{
        return await this.prisma.match.findMany({ 
            where: {
                id : match.id,
            },
            select: {
                winnerIndicator: true,
                scoreLeft: true,
                scoreRight: true,
                duration: true,
                playerRight: true,
                playerLeft: true,
                playerRightGuestName: true,
                playerLeftGuestName: true,
                id: true,
                createdAt: true,
                tournamentId: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 1,
        }) as MatchWithRelations[];
    }

	// ----------------------------------------------------------------------------- //
    async registerMatch(match: MatchData): Promise<Match | undefined> {
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

        return newmatch ? newmatch : undefined;

    }

    // ----------------------------------------------------------------------------- //
    async registerTournamentMatch(tournamentId: number, match: MatchData): Promise<number | null>
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
    async getAllMatches(userId: number): Promise<MatchSummary[]> {
            const matchs = await this.prisma.match.findMany({ 
            where: {
                OR: [
                    { playerLeftId: Number(userId) },
                    { playerRightId: Number(userId) },
                ],
            },
            select: {
                winnerIndicator: true,
                scoreLeft: true,
                scoreRight: true,
                duration: true,
                playerRight: true,
                playerLeft: true,
                playerRightGuestName: true,
                playerLeftGuestName: true,
                id: true,
                createdAt: true,
                tournamentId: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
        });

        return await this.formatMatchSummary(matchs as MatchWithRelations[], userId);
    }

    // ----------------------------------------------------------------------------- //
    async getLastMatches(userId: number, limit: number): Promise<MatchSummary[]>
    {
            const matchs = await this.prisma.match.findMany({ 
            where: {
                OR: [
                    { playerLeftId: Number(userId) },
                    { playerRightId: Number(userId) },
                ],
            },
            select: {
                winnerIndicator: true,
                scoreLeft: true,
                scoreRight: true,
                duration: true,
                playerRight: true,
                playerLeft: true,
                playerRightGuestName: true,
                playerLeftGuestName: true,
                id: true,
                createdAt: true,
                tournamentId: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: Number(limit),
        });

        return await this.formatMatchSummary(matchs as MatchWithRelations[], userId);
    }

	// ----------------------------------------------------------------------------- //
 	async getStat(playerId: number): Promise<GameStats> {
        const wins = await this.countWins(playerId);
        const losses = await this.countLosses(playerId);

        return this.calculateStats(wins, losses);
    }

	// ================================== PRIVATE ================================== //

    // ----------------------------------------------------------------------------- //
    public async formatMatchSummaryLeft(matchs: MatchWithRelations[]): Promise<MatchSummary[]> {
        return await Promise.all(matchs.map(async (m) => {
            // console.log("----------------", m, "----------------");
            // const isUserLeft = m.playerLeftId && m.playerLeftId === userId ? true : false;
            const opponentPlayer = m.playerRight;
            const opponentId = opponentPlayer?.id;


            const isWinner = (m.winnerIndicator === 'left') ? true : false;

            let isFriend; 
            if (!opponentId || !m.playerLeft || m.playerLeft?.id === null)
                isFriend = false;
            else
            {
                // console.log("Checking friendship between", opponentId, "and", m.playerLeft.id);
                isFriend = opponentId ? await this.friendService.areFriends(opponentId, m.playerLeft.id) : false;
            }
            const opponent: OpponentSummary = {
                id: opponentId,
                username: opponentPlayer?.username ?? m.playerRightGuestName,
                avatar: opponentPlayer?.avatar ?? "/api/static/public/avatarDefault.webp",
                isFriend: isFriend
            };

            const winnerScore = m.winnerIndicator === 'left' ? m.scoreLeft : m.scoreRight;
            const loserScore = m.winnerIndicator === 'left' ? m.scoreRight : m.scoreLeft;

            const winner = m.winnerIndicator === 'left' ? (m.playerLeft ?? { username: m.playerLeftGuestName }) : (m.playerRight ?? { username: m.playerRightGuestName });
            const loser = m.winnerIndicator === 'left' ? (m.playerRight ?? { username: m.playerRightGuestName }) : (m.playerLeft ?? { username: m.playerLeftGuestName });

            // console.log("Match", m);
            return {
                opponent,
                isWinner,
                match: {
                    matchId: m.id,
                    createdAt: m.createdAt,
                    winnerId: m.winnerIndicator === 'left' ? m.playerLeftId : m.playerRightId,
                    loserId: m.winnerIndicator === 'left' ? m.playerRightId : m.playerLeftId,
                    winnerName: winner.username ?? '',
                    loserName: loser.username ?? '',
                    scoreWinner: winnerScore,
                    scoreLoser: loserScore,
                    duration: m.duration,
                    tournamentId: m.tournamentId
                },
            };
        }));
    }
    
    // ----------------------------------------------------------------------------- //
    public async formatMatchSummaryRight(matchs: MatchWithRelations[]): Promise<MatchSummary[]> {
        return await Promise.all(matchs.map(async (m) => {
            // console.log("----------------", m, "----------------");
            // const isUserLeft = m.playerLeftId && m.playerLeftId === userId ? true : false;
            const opponentPlayer = m.playerLeft;
            const opponentId = opponentPlayer?.id;

            const isWinner = (m.winnerIndicator === 'right') ? true : false;

            let isFriend; 
            if (!opponentId || !m.playerRight || m.playerRight.id === null)
                isFriend = false;
            else
            {
                // console.log("Checking friendship between", opponentId, "and", m.playerRight.id);
                isFriend = opponentId ? await this.friendService.areFriends(opponentId, m.playerRight.id) : false;
            }

            const opponent: OpponentSummary = {
                id: opponentId,
                username: opponentPlayer?.username ?? m.playerLeftGuestName,
                avatar: opponentPlayer?.avatar ?? "/api/static/public/avatarDefault.webp",
                isFriend: isFriend
            };

            const winnerScore = m.winnerIndicator === 'right' ? m.scoreRight : m.scoreLeft;
            const loserScore = m.winnerIndicator === 'right' ? m.scoreLeft : m.scoreRight;

            const winner = m.winnerIndicator === 'right' ? (m.playerRight ?? { username: m.playerRightGuestName }) : (m.playerLeft ?? { username: m.playerLeftGuestName });
            const loser = m.winnerIndicator === 'right' ? (m.playerLeft ?? { username: m.playerLeftGuestName }) : (m.playerRight ?? { username: m.playerRightGuestName });

            // console.log("Match", m);
            return {
                opponent,
                isWinner,
                match: {
                    matchId: m.id,
                    createdAt: m.createdAt,
                    winnerId: m.winnerIndicator === 'right' ? m.playerRightId : m.playerLeftId,
                    loserId: m.winnerIndicator === 'right' ? m.playerLeftId : m.playerRightId,
                    winnerName: winner.username ?? '',
                    loserName: loser.username ?? '',
                    scoreWinner: winnerScore,
                    scoreLoser: loserScore,
                    duration: m.duration,
                    tournamentId: m.tournamentId
                },
            };
        }));
    }

    // ----------------------------------------------------------------------------- //
    private async formatMatchSummary(matchs: MatchWithRelations[], userId: number): Promise<MatchSummary[]> {
        return await Promise.all(matchs.map(async (m: MatchWithRelations) => {
            // Déterminer si l'utilisateur est le joueur de gauche ou de droite
            const isUserLeft = m.playerLeft?.id === userId;
            const isUserRight = m.playerRight?.id === userId;

            // Déterminer l'adversaire en fonction de la position de l'utilisateur
            let opponentPlayer;
            let opponentGuestName;
            
            if (isUserLeft) {
                opponentPlayer = m.playerRight;
                opponentGuestName = m.playerRightGuestName;
            } else if (isUserRight) {
                opponentPlayer = m.playerLeft;
                opponentGuestName = m.playerLeftGuestName;
            } else {
                // Cas où userId ne correspond à aucun joueur (ne devrait pas arriver)
                opponentPlayer = null;
                opponentGuestName = 'Guest';
            }
            
            const opponentId = opponentPlayer?.id;

            // Déterminer si l'utilisateur est le gagnant
            const isWinner = (isUserLeft && m.winnerIndicator === 'left') || 
                            (isUserRight && m.winnerIndicator === 'right');

            const opponent: OpponentSummary = {
                id: opponentId,
                username: opponentPlayer?.username ?? opponentGuestName ?? 'Unknown',
                avatar: opponentPlayer?.avatar ?? "/api/static/public/avatarDefault.webp",
                isFriend: opponentId ? await this.friendService.areFriends(userId, opponentId) : false,
            };

            const winnerScore = m.winnerIndicator === 'left' ? m.scoreLeft : m.scoreRight;
            const loserScore = m.winnerIndicator === 'left' ? m.scoreRight : m.scoreLeft;

            const winner = m.winnerIndicator === 'left' 
                ? (m.playerLeft ?? { username: m.playerLeftGuestName }) 
                : (m.playerRight ?? { username: m.playerRightGuestName });
            const loser = m.winnerIndicator === 'left' 
                ? (m.playerRight ?? { username: m.playerRightGuestName }) 
                : (m.playerLeft ?? { username: m.playerLeftGuestName });

            return {
                opponent,
                isWinner,
                match: {
                    matchId: m.id,
                    createdAt: m.createdAt,
                    winnerId: m.winnerIndicator === 'left' ? m.playerLeft?.id : m.playerRight?.id,
                    loserId: m.winnerIndicator === 'left' ? m.playerRight?.id : m.playerLeft?.id,
                    winnerName: winner.username ?? '',
                    loserName: loser.username ?? '',
                    scoreWinner: winnerScore,
                    scoreLoser: loserScore,
                    duration: m.duration,
                    tournamentId: m.tournamentId
                },
            };
        }));
    }

    // ----------------------------------------------------------------------------- //
    private async countWins(id: number): Promise<number> {
        return await this.prisma.match.count({
            where: {
                OR: [
                    { playerLeftId: id, winnerIndicator: 'left' },
                    { playerRightId: id, winnerIndicator: 'right' },
                ],
            },
        });
    }

    // ----------------------------------------------------------------------------- //
    private async countLosses(id: number): Promise<number> {
        return await this.prisma.match.count({
            where: {
                OR: [
                    { playerLeftId: id, winnerIndicator: 'right' },
                    { playerRightId: id, winnerIndicator: 'left' },
                ],
            },
        });
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
