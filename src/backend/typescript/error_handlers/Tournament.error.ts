export enum TournamentError
{
    USER_NOT_FOUND = 'User not found',
	INVALID_TOURNAMENT_ID = 'Invalid Tournament Id',
	INVALID_MATCH_ID = 'Invalid Match Id',
	TOURNAMENT_LIMIT_EXCEEDED = 'Maximum number of participants exceeded',
	TOURNAMENT_CREATION_FAILED = 'Tournament creation failed',
    INVALID_PARTICIPANT_COUNT = 'Participants count must be a power of 2',
    INVALID_MATCHUPS_COUNT = 'Invalid number of matchups',
    TOURNAMENT_NOT_FOUND = 'Tournament not found',
    MATCH_NOT_FOUND = 'Match not found',
    UNAUTHORIZED = 'Unauthorized',
}

export class TournamentException extends Error {
    constructor(public code: TournamentError, message?: string) {
        super(message ?? code);
        this.name = 'TournamentException';
    }
}
