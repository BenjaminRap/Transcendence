import { MatchStatus, TournamentStatus } from '@prisma/client';
import { TournamentException, TournamentError } from '../error_handlers/Tournament.error.js';
import { MatchService } from './MatchService.js';
export class TournamentService {
    constructor(prisma, matchService) {
        this.prisma = prisma;
        this.matchService = matchService;
    }
    // ----------------------------------------------------------------------------- //
    async createTournament(data) {
        // Create Tournament
        const participants = data.participants.map(participant => ({
            alias: participant.alias,
            userId: participant.userId ?? null,
            guestName: participant.userGuestName
        }));
        const tournament = await this.prisma.tournament.create({
            data: {
                title: data.title,
                status: TournamentStatus.ONGOING,
                creatorId: data.adminUserId ?? null,
                creatorGuestName: data.adminGuestName,
                participants: {
                    create: participants,
                },
            },
        });
        // Generate Bracket & Start Initial Matches
        // We create ALL matches for the bracket structure now to have IDs
        const matchesCreated = [];
        // Round 1
        for (let i = 0; i < data.matchups.length; i++) {
            const matchup = data.matchups[i];
            const match = await this.matchService.startTournamentMatch(tournament.id, 1, i, matchup.player1, matchup.player2);
            matchesCreated.push(match);
        }
        // Subsequent Rounds placeholders
        const pcount = participants.length;
        const totalRounds = Math.log2(pcount);
        let matchesInRound = pcount / 2;
        for (let round = 2; round <= totalRounds; round++) {
            matchesInRound /= 2;
            for (let i = 0; i < matchesInRound; i++) {
                await this.matchService.createBracketMatch(tournament.id, round, i);
            }
        }
        // Construct return state
        // thats a table with each player alias and their current match id
        const playersState = data.participants.map(participant => {
            let currentMatchId = null;
            // Check in created matches (Round 1)
            for (const match of matchesCreated) {
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
    async getTournamentById(tournamentId) {
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
    async updateTournamentProgress(tournamentId, matchData) {
        if (matchData.matchId <= 0 || tournamentId <= 0) {
            throw new TournamentException(TournamentError.INVALID_MATCH_ID);
        }
        // 1. Check Tournament Status FIRST
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { status: true, participants: true }
        });
        if (!tournament)
            throw new TournamentException(TournamentError.TOURNAMENT_NOT_FOUND);
        if (tournament.status !== TournamentStatus.ONGOING) {
            throw new TournamentException(TournamentError.UNAUTHORIZED, `Cannot update match: Tournament is ${tournament.status}`);
        }
        // 2. Strict Match Retrieval (Security & Validation)
        const match = await this.prisma.match.findFirst({
            where: {
                id: matchData.matchId,
                tournamentId: tournamentId,
                OR: [
                    { player1GuestName: matchData.winner.guestName, player2GuestName: matchData.loser.guestName },
                    { player1GuestName: matchData.loser.guestName, player2GuestName: matchData.winner.guestName }
                ]
            }
        });
        if (!match) {
            throw new TournamentException(TournamentError.MATCH_NOT_FOUND, `Match ${matchData.matchId} not found or players mismatch in tournament ${tournamentId}.`);
        }
        // 3. Structural Validation
        const m = match;
        if (!m.round || m.matchOrder === null || m.matchOrder === undefined) {
            console.error(`Tournament match ${match.id} integrity error: missing round/order.`);
            throw new TournamentException(TournamentError.MATCH_NOT_FOUND);
        }
        // 4. Save Match Result
        await this.matchService.endMatch(matchData);
        // 5. Update Loser Rank (Optional - Implementation depends on ranking logic preference)
        await this.setParticipantRank(tournamentId, matchData.loser, m.round, false, tournament.participants.length);
        // 6. Advancement Logic
        const currentRound = m.round;
        const currentOrder = m.matchOrder;
        const totalParticipants = tournament.participants.length;
        const totalRounds = Math.ceil(Math.log2(totalParticipants));
        if (currentRound >= totalRounds) {
            // Check for tournament finish (Final Match)
            // Winner gets Rank 1
            await this.setParticipantRank(tournamentId, matchData.winner, currentRound, true, totalParticipants);
            await this.finishTournament(tournamentId);
            return;
        }
        const nextRound = currentRound + 1;
        const nextMatchOrder = Math.floor(currentOrder / 2);
        const isPlayer1InNext = (currentOrder % 2 === 0);
        // Find next match
        const nextMatch = await this.prisma.match.findFirst({
            where: {
                tournamentId,
                round: nextRound,
                matchOrder: nextMatchOrder
            }
        });
        if (nextMatch) {
            const updateData = {};
            if (isPlayer1InNext) {
                updateData.player1Id = matchData.winner.id;
                updateData.player1GuestName = matchData.winner.guestName;
            }
            else {
                updateData.player2Id = matchData.winner.id;
                updateData.player2GuestName = matchData.winner.guestName;
            }
            await this.prisma.match.update({
                where: { id: nextMatch.id },
                data: updateData
            });
        }
        else {
            console.error(`CRITICAL: Next match not found for Tournament ${tournamentId}: Round ${nextRound}, Order ${nextMatchOrder}. Bracket is broken.`);
        }
    }
    // ----------------------------------------------------------------------------- //
    async startNextMatch(tournamentId, player1, player2) {
        const matchId = await this.prisma.match.findFirst({
            where: {
                tournamentId,
                status: MatchStatus.IN_PROGRESS,
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
                ],
                select: { id: true }
            }
        });
        if (!matchId)
            throw new TournamentException(TournamentError.MATCH_NOT_FOUND);
        return { matchId: matchId.id };
    }
    // ----------------------------------------------------------------------------- //
    async updateTournamentStatus(tournamentId, status) {
        const tournament = await this.prisma.tournament.update({
            where: { id: tournamentId },
            data: { status },
        });
        return tournament;
    }
    // ----------------------------------------------------------------------------- //
    /**
     * verifier que tous les matchs sont bien termines au debut de la fonction
     *
     */
    async finishTournament(tournamentId) {
        // Log consistency check
        const remainingMatches = await this.prisma.match.count({
            where: { tournamentId, status: MatchStatus.IN_PROGRESS }
        });
        if (remainingMatches > 0) {
            console.warn(`Tournament ${tournamentId} finished with ${remainingMatches} matches still IN_PROGRESS. Cancelling them.`);
        }
        // Force cleanup of any zombie matches to CANCELLED instead of FINISHED
        // because they were not played.
        await this.prisma.match.updateMany({
            where: {
                tournamentId,
                status: MatchStatus.IN_PROGRESS
            },
            data: {
                status: MatchStatus.CANCELLED
            }
        });
        const tournament = await this.updateTournamentStatus(tournamentId, TournamentStatus.FINISHED);
        return tournament;
    }
    // ----------------------------------------------------------------------------- //
    async cancelTournament(tournamentId, adminId, adminGuestName) {
        const tournament = await this.getTournamentById(tournamentId);
        if (tournament.status === TournamentStatus.FINISHED || tournament.status === TournamentStatus.CANCELLED) {
            return tournament;
        }
        const isCreator = (tournament.creatorId === adminId) &&
            (tournament.creatorGuestName === adminGuestName);
        if (!isCreator)
            throw new TournamentException(TournamentError.UNAUTHORIZED);
        // Cancel ALL matches (InProgress AND placeholders to lock the bracket)
        await this.prisma.match.updateMany({
            where: {
                tournamentId,
                status: MatchStatus.IN_PROGRESS
            },
            data: {
                status: MatchStatus.CANCELLED
            }
        });
        // Notify players logic should go here (Websockets)
        return await this.updateTournamentStatus(tournamentId, TournamentStatus.CANCELLED);
    }
    // ----------------------------------------------------------------------------- //
    async setParticipantRank(tournamentId, player, round, isWinner, totalParticipants) {
        let rank = 0;
        if (isWinner) {
            // Attention : Ne mettre true que si c'est le vainqueur de la GRANDE FINALE
            rank = 1;
        }
        else {
            // Formule simplifiée : Rank = (Nombre de joueurs éliminés avant moi + ceux qui restent) ...
            // Plus simple : Si je perds au Round R, il y a (Total / 2^R) joueurs qui sont meilleurs que moi.
            // Donc mon rang est (Total / 2^R) + 1.
            // Ex: 8 joueurs. Round 1. 8 / 2^1 = 4. Rang = 5.
            // Ex: 8 joueurs. Round 2. 8 / 2^2 = 2. Rang = 3.
            // Ex: 8 joueurs. Round 3. 8 / 2^3 = 1. Rang = 2.
            const betterPlayersCount = totalParticipants / Math.pow(2, round);
            rank = Math.floor(betterPlayersCount) + 1;
        }
        try {
            // Finding the unique ID for the participant row
            const whereCondition = { tournamentId };
            if (player.id) {
                whereCondition.userId = player.id;
            }
            else {
                whereCondition.guestName = player.guestName;
            }
            // Note: Prisma updateMany doesn't allow updating unique constraints easily if not selected by unique,
            // but here we filter by tournamentId + userId/guestName which is unique in schema.
            // However, updateMany is safer if we don't have the primary key (id) of TournamentParticipant.
            await this.prisma.tournamentParticipant.updateMany({
                where: whereCondition,
                data: { finalRank: rank }
            });
        }
        catch (error) {
            console.warn(`Failed to set rank for user ${player.guestName}:`, error);
        }
    }
    // ----------------------------------------------------------------------------- //
    async getUserTournaments(userId) {
        /**
         * les participants peuvent etre des guests, on doit aussi les recuperer
         * donc user peut etre null et on doit le gerer correctement
         */
        const tournaments = await this.prisma.tournament.findMany({
            where: {
                participants: {
                    some: { userId: userId }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { avatar: true }
                        }
                    },
                    orderBy: {
                        finalRank: 'asc'
                    }
                },
                matches: {
                    where: {
                        status: MatchStatus.FINISHED
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return tournaments.map((t) => {
            const ranking = t.participants.map((p) => ({
                rank: p.finalRank ?? 0,
                alias: p.alias,
                avatar: p.user?.avatar || process.env.DEFAULT_AVATAR_URL || "http://localhost:8181/static/public/avatarDefault.webp"
            }));
            const matches = t.matches.map((m) => {
                const p1Winner = m.player1GuestName === m.winnerGuestName;
                return {
                    player1Name: m.player1GuestName,
                    player2Name: m.player2GuestName,
                    scoreP1: p1Winner ? (m.scoreWinner ?? 0) : (m.scoreLoser ?? 0),
                    scoreP2: p1Winner ? (m.scoreLoser ?? 0) : (m.scoreWinner ?? 0),
                    round: m.round ?? 0
                };
            });
            return {
                id: t.id,
                title: t.title,
                status: t.status,
                createdAt: t.createdAt,
                ranking,
                matches
            };
        });
    }
}
