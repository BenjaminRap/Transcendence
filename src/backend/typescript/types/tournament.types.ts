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

export interface TournamentParticipant {
    alias: string;
    userId?: number;
	userGuestName?: string;
    finalRank?: number;
    isActive: boolean;
    tournamentId: number;
}

export interface CreateTournament {
	title: string;
	adminUserId?: number;
	adminGuestName?: string;
	participants: TournamentParticipant[];
	matchups: StartMatchData[];
}