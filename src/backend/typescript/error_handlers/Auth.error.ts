export enum AuthError {
    USR_NOT_FOUND = 'User not found',
    USERNAME_TAKEN = 'username already taken',
    EMAIL_TAKEN = 'email already registered',
    INVALID_CREDENTIALS= 'Invalid credentials' 
}

export class AuthException extends Error {
    constructor(public code: AuthError, message?: string) {
        super(message ?? code);
        this.name = 'FriendException';
    }
}
