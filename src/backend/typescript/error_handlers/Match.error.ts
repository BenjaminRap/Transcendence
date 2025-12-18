export enum MatchError {
    USR_NOT_FOUND = 'User not found',
    INVALID_OPPONENT = 'Invalid opponent type',
	INVALID_TOURNAMENT = 'Invalid tournament',
}

export class MatchException extends Error {
    constructor(public code: MatchError, message?: string) {
        super(message ?? code);
        this.name = 'FriendException';
    }
}
