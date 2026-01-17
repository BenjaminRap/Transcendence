import { type Match } from '@prisma/client';
import { MatchService } from '../services/MatchService.js';
import { OPPONENT_LEVEL, type StartMatchData, type EndMatchData, type MatchData } from '../types/match.types.js';
import { MatchException, MatchError } from '../error_handlers/Match.error.js';
import { FriendService } from '../services/FriendService.js';
import { SocketEventController } from './SocketEventController.js';
import { randomUUID } from 'crypto';
import type { FriendProfile } from '../types/friend.types.js';
import type { PlayerInfo, MatchResult } from '../types/match.types.js';

export class MatchController {
	constructor(
		private matchService: MatchService,
		private friendService: FriendService,
	) {}

    // =================================== PUBLIC ==================================== //

    // --------------------------------------------------------------------------------- //
    async startMatch(data: StartMatchData): Promise<{ success: boolean, message?: string, matchData?: MatchData }> {
        try {
            const player1 = await this.checkMatchData(data.player1.level, data.player1.id);

            const player2 = await this.checkMatchData(data.player2.level, data.player2.id);

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
    async endMatch(data: EndMatchData): Promise<{ success: boolean, message?: string, matchResult?: MatchResult }> {
        try {
            const match = await this.matchService.getMatchInProgress(data.matchId as number);
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
                    matchId: data.matchId as number,
                    winner: data.winner,
                    loser: data.loser,
                    scoreWinner: data.scoreWinner as number,
                    scoreLoser: data.scoreLoser as number,
                    duration: data.duration,
                } as MatchResult
            };
        }
        catch (error) {
            console.warn(error);
            return { success: false, message: "An error occurred when fetching the database" };
        }
    }

    // =================================== PRIVATE ==================================== //

	// ----------------------------------------------------------------------------- //
	// async getStats(ids: number[]) : Promise<{ success: boolean, message?: string, stats?: GameStats[] }> {
	// 	try {
	// 		// verification pathern
	// 		const zodParsing = CommonSchema.Ids.safeParse(ids);
	// 		if (!zodParsing.success)
	// 			return { success: false, message: zodParsing.error?.issues?.[0]?.message || 'Error ids format' }
	
	// 		// duplication detection
	// 		const parsedIds = [...new Set(zodParsing.data)] ;
	// 		if (parsedIds.length !== ids.length)
	// 			return { success: false, message: 'Duplicate ids detected' }
			
	// 		// call db 
	// 		const stats = await this.matchService.getStats(parsedIds);
	// 		if (!stats.stats)
	// 			return { success: false, message: stats.message || 'Error retrieving stats'}
	
	// 		return {
	// 			success: true,
	// 			stats: stats.stats
	// 		};			
	// 	} catch (error) {
	// 		return {
	// 			success: false,
	// 			message: 'Error retrieving data from the database'
	// 		}
	// 	}
	// }
	
	// ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private async checkMatchData(level: string | undefined, id: number | undefined): Promise<PlayerInfo>
    {
		if (level) {
            return { id: undefined, level: this.manageOpponent(level as OPPONENT_LEVEL) }
		}
		else if (id) {
            const user: FriendProfile | null = await this.friendService.getById(Number(id));
            if(!user)
                throw new MatchException(MatchError.USR_NOT_FOUND, 'User with id ' + id.toString() + ' of the match not found');
            
            return { id: user.id, level: undefined }
        }
        else
            throw new MatchException(MatchError.INVALID_OPPONENT, "No opponent define");
    }

    // --------------------------------------------------------------------------------- //
    private manageOpponent(level: OPPONENT_LEVEL): string
    {
        switch (level)
        {
            case OPPONENT_LEVEL.GUEST:
                return this.createAlias('Guest_');
            case OPPONENT_LEVEL.AI:
                return this.createAlias('AI_');
            default:
                throw new MatchException(MatchError.INVALID_OPPONENT, 'Unknow opponent type');
        }
    }

    // --------------------------------------------------------------------------------- //
    private createAlias(level: string): string {
        return `${level}${randomUUID().split('-')[0]}`;
    }

    // --------------------------------------------------------------------------------- //
    private validDataMatch(data: EndMatchData, match: Match) : { success: boolean, message?: string }
    {
        // check if the match is not terminated
        if (match.status !== 'IN_PROGRESS') {
            return {
                success: false,
                message: 'Match already terminated',
            }
        }

        // players identifiers from the match record 
        const p1 = { 
            id: match.player1Id ?? null, 
            level: match.player1Level ?? null 
        };
        const p2 = { 
            id: match.player2Id ?? null, 
            level: match.player2Level ?? null 
        };
        
        // participants identifiers from the match end data
        const winner = { 
            id: data.winner?.id ?? null, 
            level: data.winner?.level ?? null 
        };
        const loser = { 
            id: data.loser?.id ?? null, 
            level: data.loser?.level ?? null 
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
    private isSameParticipant(
        a: { id: number | null, level: string | null }, 
        b: { id: number | null, level: string | null }
    ): boolean {
        if (a.id !== b.id) return false;
        if (a.level !== b.level) return false;

        return true;
    }
}
