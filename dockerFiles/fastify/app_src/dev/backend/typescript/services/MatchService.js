import { MatchStatus } from '@prisma/client';
import { FriendService } from './FriendService.js';
export class MatchService {
    constructor(prisma, friendService) {
        this.prisma = prisma;
        this.friendService = friendService;
    }
    // ----------------------------------------------------------------------------- //
    async startMatch(player1, player2) {
        const match = await this.prisma.match.create({
            data: {
                player1Id: player1.id ?? null,
                player1GuestName: player1.guestName,
                player2Id: player2.id ?? null,
                player2GuestName: player2.guestName,
                winnerGuestName: "",
                loserGuestName: "",
            }
        });
        return match.id;
    }
    // ----------------------------------------------------------------------------- //
    async endMatch(matchData) {
        await this.prisma.match.update({
            where: { id: matchData.matchId },
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
    async getTournamentMatch(tournamentId, matchData) {
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
    async getMatchInProgress(matchId) {
        return this.prisma.match.findFirst({
            where: {
                id: matchId,
                status: MatchStatus.IN_PROGRESS
            }
        });
    }
    // --------------------------------------- -------------------------------------- //
    calculateStats(matchesWons, matchesLoses) {
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
    async getLastMatches(userId, matchesWons, matchesLoses, limit) {
        const allMatches = [
            ...(matchesWons || []),
            ...(matchesLoses || []),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
        return Promise.all(allMatches.map(async (match) => {
            const isUserWinner = match.winnerId === userId;
            const opponentUser = isUserWinner ? match.loser : match.winner;
            const opponentGuestName = isUserWinner ? match.loserGuestName : match.winnerGuestName;
            let opponentSummary;
            if (opponentUser) {
                // if user exists in DB
                opponentSummary = {
                    id: Number(opponentUser.id),
                    username: opponentUser.username,
                    avatar: opponentUser.avatar,
                    isFriend: await this.friendService.isFriend(userId, Number(opponentUser.id))
                };
            }
            else {
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
                    },
                    loser: {
                        id: match.loserId ?? undefined,
                        guestName: match.loserGuestName,
                    },
                },
            };
        }));
    }
    // ----------------------------------------------------------------------------- //
    async getStats(playerIds) {
        if (!await this.theyExist(playerIds))
            return { stats: null, message: 'One or more players do not exist' };
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
            const won = wins.find((w) => w.winnerId === id)?._count ?? 0;
            const lost = losses.find((l) => l.loserId === id)?._count ?? 0;
            return this.calculateStats(won, lost);
        });
        return { stats };
    }
    // ----------------------------------------------------------------------------- //
    async getStat(playerId) {
        if (!await this.isExisting(playerId))
            return { stats: null, message: 'Player does not exist' };
        const wins = await this.prisma.match.count({
            where: { winnerId: playerId }
        });
        const losses = await this.prisma.match.count({
            where: { loserId: playerId }
        });
        const stats = this.calculateStats(wins, losses);
        return { stats };
    }
    // ----------------------------------------------------------------------------- //
    async startTournamentMatch(tournamentId, round, matchOrder, player1, player2) {
        return this.prisma.match.create({
            data: {
                tournamentId,
                round,
                matchOrder,
                player1Id: player1.id ?? null,
                player1GuestName: player1.guestName,
                player2Id: player2.id ?? null,
                player2GuestName: player2.guestName,
                winnerGuestName: "",
                loserGuestName: "",
                status: MatchStatus.IN_PROGRESS
            }
        });
    }
    // ----------------------------------------------------------------------------- //
    async createBracketMatch(tournamentId, round, matchOrder) {
        return this.prisma.match.create({
            data: {
                tournamentId,
                round,
                matchOrder,
                player1GuestName: "",
                player2GuestName: "",
                winnerGuestName: "",
                loserGuestName: "",
                status: MatchStatus.IN_PROGRESS
            }
        });
    }
    // ================================== PRIVATE ================================== //
    // ----------------------------------------------------------------------------- //
    async theyExist(ids) {
        const existingUsers = await this.prisma.user.findMany({
            where: { id: { in: ids } },
            select: { id: true }
        });
        const existingIds = existingUsers.map((u) => u.id);
        const missingIds = ids.filter(ids => !existingIds.includes(ids));
        if (missingIds.length > 0)
            return false;
        return true;
    }
    // ----------------------------------------------------------------------------- //
    async isExisting(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: { id: true }
        });
        return user !== null;
    }
}
