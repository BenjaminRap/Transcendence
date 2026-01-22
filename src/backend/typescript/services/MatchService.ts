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
    async registerMatch(match: MatchData): Promise<number | null> {
        const data = {
            leftId: match.leftId ?? null,
            leftGuestName: match.leftGuestName,

            rightId: match.rightId ?? null,
            rightGuestName: match.rightGuestName,

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
            leftId: match.leftId ?? null,
            leftGuestName: match.leftGuestName,

            rightId: match.rightId ?? null,
            rightGuestName: match.rightGuestName,

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
    async getLastMatches(userId: number, limit: number): Promise<MatchSummary[]>
    {
            const matchs = await this.prisma.match.findMany({ 
            where: {
                playerLeftId: userId,
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
            }
        });

        // renvoyer MatchSummary[]

        // mapper chaque match pour renvoyer le bon format
        const summary: MatchSummary[] = matchs.map((m) => {
            opponent: {
                id: m.playerRightId === userId ? m.playerLeft?.id : m.playerRight?.id,
                username: m.playerRightId === userId ? m.playerLeft?.username : m.playerRight?.username,
                avatar: m.playerRightId === userId ? m.playerLeft?.avatar : m.playerRight?.avatar,
                isFriend: false // a implementer plus tard
            },
            matchResult: {
                matchId: m.id,
                scoreWinner: m.winnerIndicator === 'left' ? m.scoreLeft : m.scoreRight,
                scoreLoser: m.winnerIndicator === 'left' ? m.scoreRight : m.scoreLeft,
                duration: m.duration,
                winnerName: m.winnerIndicator === 'left' ? (m.playerLeft?.username || m.leftGuestName) : (m.playerRight?.username || m.rightGuestName),
                loserName: m.winnerIndicator === 'left' ? (m.playerRight?.username || m.rightGuestName) : (m.playerLeft?.username || m.leftGuestName),
            },
        });
    }

	// ----------------------------------------------------------------------------- //
 	async getStat(playerId: number): Promise<{stats: GameStats | null, message?: string }> {
        if (!await this.isExisting(Number(playerId)))
            return { stats: null, message: 'Player does not exist' }

        const wins = await this.countMatchAs(playerId, 'left');

        const lose = await this.countMatchAs(playerId, 'right');

        const stats: GameStats = this.calculateStats(wins, lose);

        return { stats };
    }

	// ================================== PRIVATE ================================== //

	// ----------------------------------------------------------------------------- //
    private async countMatchAs(id: number, indic: string): Promise<number> {
        
        const left = await this.prisma.match.count({
            where: { playerLeftId: id, winnerIndicator: indic },
        });

        const other = indic === 'left' ? 'right' : 'left';

        const right = await this.prisma.match.count({
            where: { playerRightId: id, winnerIndicator: other }
        });
        return left + right;
    }

	// ----------------------------------------------------------------------------- //
	private async isExisting(id: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id: Number(id) },
			select: { id: true }
		});
		return user !== null;
	}
}
