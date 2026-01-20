export var AuthError;
(function (AuthError) {
    AuthError["USR_NOT_FOUND"] = "User not found";
    AuthError["USERNAME_TAKEN"] = "username already taken";
    AuthError["EMAIL_TAKEN"] = "email already registered";
    AuthError["INVALID_CREDENTIALS"] = "Invalid credentials";
})(AuthError || (AuthError = {}));
export class AuthException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'FriendException';
    }
}
