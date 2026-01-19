import type { StartMatchData, EndMatchData } from './match.types.js';
import { TournamentStatus } from '@prisma/client';

export interface Tournament {
    id: number;
    title: string;
    maxParticipants: number;
    status: TournamentStatus;
    createdAt: Date;
    updatedAt: Date;
    creatorId?: number;
	creatorGuestName?: string;
}

// NE PAS MODIFIER (sauf nécessité absolue)
export interface PlayerInfo {
    id?: number,
    guestName?: string,
}

export interface TournamentParticipant {
    alias: string;
    userId?: number;
    userGuestName: string;
}

export interface CreateTournament {
    title: string;
    adminUserId?: number;
    adminGuestName: string;
    participants: TournamentParticipant[];
    matchups: StartMatchData[];
}

export interface TournamentProgress {
    tournamentId: number,
    matchsResults: EndMatchData[]
}

export interface TournamentState {
    tournamentId: number,
    players: Array<{
        participantAlias: string,
        currentMatchId: number | null
    }>
}

export interface TournamentMatchResult {
    player1Name: string;
    player2Name: string;
    scoreP1: number;
    scoreP2: number;
    round: number;
}

export interface TournamentRanking {
    rank: number | null;
    alias: string;
    avatar: string;
}

export interface UserTournament {
    id: number;
    title: string;
    status: TournamentStatus;
    createdAt: Date;
    ranking: TournamentRanking[];
    matches: TournamentMatchResult[];
}