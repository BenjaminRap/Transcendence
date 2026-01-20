import { MatchStatus } from '@prisma/client';
import { MatchService } from '../services/MatchService.js';
import {} from '../types/match.types.js';
import { MatchException, MatchError } from '../error_handlers/Match.error.js';
import { FriendService } from '../services/FriendService.js';
import { SocketEventController } from './SocketEventController.js';
import { randomUUID } from 'crypto';
export class MatchController {
    constructor(matchService, friendService) {
        this.matchService = matchService;
        this.friendService = friendService;
    }
    // =================================== PUBLIC ==================================== //
    // --------------------------------------------------------------------------------- //
    async startMatch(data) {
        try {
            const player1 = await this.checkMatchData(data.player1.guestName, data.player1.id);
            const player2 = await this.checkMatchData(data.player2.guestName, data.player2.id);
            const matchId = await this.matchService.startMatch(player1, player2);
            return {
                success: true,
                matchData: {
                    matchId: matchId,
                    player1Info: player1,
                    player2Info: player2,
                }
            };
        }
        catch (error) {
            if (error instanceof MatchException)
                return { success: false, message: error?.message || "An error occurred during the start of the match." };
            console.warn(error);
            return { success: false, message: "An error occurred when fetching the database" };
        }
    }
    // --------------------------------------------------------------------------------- //
    async endMatch(data) {
        try {
            const match = await this.matchService.getMatchInProgress(Number(data.matchId));
            if (!match) {
                return { success: false, message: `Match with id ${data.matchId} not found` };
            }
            const validData = this.validDataMatch(data, match);
            if (!validData.success) {
                return { success: false, message: validData.message };
            }
            await this.matchService.endMatch(data);
            // send updated stats to the players via websocket
            if (data.loser?.id) {
                const loserStats = await this.matchService.getStat(data.loser.id);
                if (loserStats.stats) {
                    SocketEventController.notifyProfileChange(data.loser.id, 'game-stats-update', { stats: loserStats.stats });
                }
            }
            if (data.winner?.id) {
                const winnerStats = await this.matchService.getStat(data.winner.id);
                if (winnerStats.stats) {
                    SocketEventController.notifyProfileChange(data.winner.id, 'game-stats-update', { stats: winnerStats.stats });
                }
            }
            return {
                success: true,
                matchResult: {
                    matchId: Number(data.matchId),
                    winner: data.winner,
                    loser: data.loser,
                    scoreWinner: Number(data.scoreWinner),
                    scoreLoser: Number(data.scoreLoser),
                    duration: Number(data.duration),
                }
            };
        }
        catch (error) {
            console.warn(error);
            return { success: false, message: "An error occurred when fetching the database" };
        }
    }
    // --------------------------------------------------------------------------------- //
    createAlias(name) {
        if (!name || name.length < 3 || name.length > 12)
            return { success: false, message: 'Invalid alias name length (3-12 characters)' };
        return { success: true, alias: this.generateName(`${name}_`) };
    }
    // =================================== PRIVATE ==================================== //
    // --------------------------------------------------------------------------------- //
    async checkMatchData(guestName, id) {
        if (id) {
            const user = await this.friendService.getById(Number(id));
            if (!user)
                throw new MatchException(MatchError.USR_NOT_FOUND, 'User with id ' + id.toString() + ' of the match not found');
        }
        if (guestName.length < 3 || guestName.length > 20)
            throw new MatchException(MatchError.INVALID_OPPONENT, 'Alias length must be between 3 and 20 characters');
        return { id, guestName };
    }
    // --------------------------------------------------------------------------------- //
    generateName(level) {
        return `${level}${randomUUID().split('-')[0]}`;
    }
    // --------------------------------------------------------------------------------- //
    validDataMatch(data, match) {
        // check if the match is not terminated
        if (match.status !== MatchStatus.IN_PROGRESS) {
            return {
                success: false,
                message: 'Match already terminated',
            };
        }
        // players identifiers from the match record 
        const p1 = {
            id: match.player1Id ?? null,
            guestName: match.player1GuestName
        };
        const p2 = {
            id: match.player2Id ?? null,
            guestName: match.player2GuestName
        };
        // participants identifiers from the match end data
        const winner = {
            id: data.winner?.id ?? null,
            guestName: data.winner?.guestName
        };
        const loser = {
            id: data.loser?.id ?? null,
            guestName: data.loser?.guestName
        };
        // Scénario A : Player 1 won, Player 2 lost
        const scenarioA = this.isSameParticipant(p1, winner) && this.isSameParticipant(p2, loser);
        // Scénario B : Player 1 lost, Player 2 won
        const scenarioB = this.isSameParticipant(p1, loser) && this.isSameParticipant(p2, winner);
        if (scenarioA || scenarioB) {
            return { success: true };
        }
        return {
            success: false,
            message: 'Match data (winner/loser identities) does not correspond to the registered match players'
        };
    }
    // ----------------------------------------------------------------------------- //
    isSameParticipant(a, b) {
        if (a.id !== b.id)
            return false;
        // If it's a registered user (id defined), we don't enforce guestName match
        // allowing frontend to send simplified data (e.g. only id)
        if (a.id)
            return true;
        if (a.guestName !== b.guestName)
            return false;
        return true;
    }
}
