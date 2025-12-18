export enum FriendError {
    USR_NOT_FOUND = 'User not found',
    INVALID_ID = 'Invalid Id',
    ACCEPTED = 'Already friends',
    PENDING = 'Friendship in pending mod',
    NO_LINK = 'No relationship'
}

export class FriendException extends Error {
    constructor(public code: FriendError, message?: string) {
        super(message ?? code);
        this.name = 'FriendException';
}
}
