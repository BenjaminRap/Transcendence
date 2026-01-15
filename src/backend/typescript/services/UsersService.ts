import { PrismaClient, type Match } from "@prisma/client";
import type { PublicProfile } from "../types/users.types.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";
import type { GameStats } from "../types/match.types.js";
import type { MatchSummary } from "../types/suscriber.types.js";
import { FriendService } from "./FriendService.js";


export class UsersService {
    constructor(
        private prisma: PrismaClient,
        private friendService: FriendService,
    ) {}

    // ----------------------------------------------------------------------------- //
    async getById(id: number, userId: number): Promise<PublicProfile | null> {
        if ( !await this.checkIfUserExists(userId) ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No suscriber found');
        }

        const takeLimit = 10;
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: { matchesWons: true, matchesLoses: true }
                },
                matchesWons: { 
                    include: { loser: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit
                },
                matchesLoses: { 
                    include: { winner: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit
                }
            }
        });

        if (!user)
            throw new UsersException(UsersError.USER_NOT_FOUND, 'User not found');

        return {
            id: user.id,
            avatar: user.avatar,
            username: user.username,
            stats: this.calculateStats(user._count.matchesWons, user._count.matchesLoses),
            lastMatchs: this.getLastMatches(user.matchesWons, user.matchesLoses, 4),
            isFriend: await this.friendService.isFriend(user.id, userId),
        }
    }

    // ----------------------------------------------------------------------------- //
    async getByName(username: string, userId: number): Promise<PublicProfile[]>
    {
        if ( !await this.checkIfUserExists(userId) ){
            throw new UsersException(UsersError.USER_NOT_FOUND, 'No suscriber found');
        }

        const takeLimit = 10;
        // Ajout de _count pour avoir les vraies stats
        const users = await this.prisma.user.findMany({
            where: {
                username: { contains: username }
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                _count: { // IMPORTANT: Compter le total réel
                    select: { matchesWons: true, matchesLoses: true }
                },
                matchesWons: { 
                    include: { loser: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit 
                },
                matchesLoses: { 
                    include: { winner: true },
                    orderBy: { createdAt: 'desc' },
                    take: takeLimit 
                }
            },
            take: takeLimit
        });

        if (!users || users.length === 0)
            throw new UsersException(UsersError.USER_NOT_FOUND, 'User not found');

        return await Promise.all(users.map(async (user) => {
            return {
                id: user.id,
                avatar: user.avatar,
                username: user.username,
                stats: this.calculateStats(user._count.matchesWons, user._count.matchesLoses),
                lastMatchs: this.getLastMatches(user.matchesWons, user.matchesLoses, 4),
                isFriend: await this.friendService.isFriend(user.id, userId),
            };
        }));
    }
    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private async checkIfUserExists(id: number): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!user) {
            return false;
        }
        return true;
    }

    // ----------------------------------------------------------------------------- //
    private calculateStats(matchesWon: number, matchesLost: number): GameStats {
        const totalMatches = matchesWon + matchesLost;
        const ratio = totalMatches > 0 ? (matchesWon / totalMatches * 100).toFixed(2) : "0.00";

        return {
            wins: matchesWon,
            losses: matchesLost,
            total: totalMatches,
            winRate: parseFloat(ratio),
        };
    }

    // ----------------------------------------------------------------------------- //
    private getLastMatches(matchesWons: any[], matchesLoses: any[], limit: number): MatchSummary[] {
        const allMatches = [
            ...(matchesWons || []),
            ...(matchesLoses || []),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

        return allMatches.map(match => {
            const opponentObj = match.loser || match.winner;

            return {
                opponent: opponentObj ? {
                    id: opponentObj.id.toString(),
                    username: opponentObj.username,
                    avatar: opponentObj.avatar
                } : null,
                match: match as Match,
            } as MatchSummary;
        });
    }
}