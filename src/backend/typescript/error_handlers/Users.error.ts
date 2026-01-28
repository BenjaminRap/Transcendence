export enum UsersError
{
    USER_NOT_FOUND = 'User not found',
    INVALID_ID = 'Invalid Id format',
    INVALID_NAME = 'Invalid name format'
}

export class UsersException extends Error {
    constructor(public code: UsersError, message?: string) {
        super(message ?? code);
        this.name = 'UsersException';
    }
}
