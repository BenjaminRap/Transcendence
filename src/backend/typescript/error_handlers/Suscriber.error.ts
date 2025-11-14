export enum SuscriberError
{
    BAD_FORMAT = 'Data is not in the correct format',
    USER_NOT_FOUND = 'User not found',
    USRNAME_ERROR = 'Username must change',
    PASSWD_ERROR = 'Password must change',
    AVATAR_ERROR = 'Avatar must change',
    USRNAME_ALREADY_USED = 'This username is already used',
}

export class SuscriberException extends Error {
    constructor(public code: SuscriberError, message?: string) {
        super(message ?? code);
        this.name = 'SuscriberException';
    }
}
