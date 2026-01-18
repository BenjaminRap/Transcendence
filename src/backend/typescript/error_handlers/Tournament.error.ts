export enum TournamentError
{
    USER_NOT_FOUND = 'User not found',
	INVALID_TOURNAMENT_ID = 'Invalid Tournament Id',
	INVALID_MATCH_ID = 'Invalid Match Id',
	TOURNAMENT_LIMIT_EXCEEDED = 'Maximum number of participants exceeded',
	TOURNAMENT_CREATION_FAILED = 'Tournament creation failed',
}

export class TournamentException extends Error {
    constructor(public code: TournamentError, message?: string) {
        super(message ?? code);
        this.name = 'SuscriberException';
    }
}
