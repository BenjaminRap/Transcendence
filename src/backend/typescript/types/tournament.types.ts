import type { StartMatchData } from './match.types.js';

export interface Tournament {
    id: number;
    title: string;
    maxParticipants: number;
    status: 'ONGOING' | 'FINISHED' | 'CANCELED';
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
    completedMatches: Array<{
        matchId: number,
        winnerId: number | string
    }>
}

export interface TournamentState {
    tournamentId: number,
    players: Array<{
        participantAlias: string,
        currentMatchId: number | null
    }>
}