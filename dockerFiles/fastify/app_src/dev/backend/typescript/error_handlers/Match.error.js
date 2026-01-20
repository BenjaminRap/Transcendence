export var MatchError;
(function (MatchError) {
    MatchError["USR_NOT_FOUND"] = "User not found";
    MatchError["INVALID_OPPONENT"] = "Invalid opponent type";
    MatchError["INVALID_TOURNAMENT"] = "Invalid tournament";
})(MatchError || (MatchError = {}));
export class MatchException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'FriendException';
    }
}
