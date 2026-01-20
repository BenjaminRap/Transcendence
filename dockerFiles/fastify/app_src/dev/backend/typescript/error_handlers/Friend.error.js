export var FriendError;
(function (FriendError) {
    FriendError["USR_NOT_FOUND"] = "User not found";
    FriendError["INVALID_ID"] = "Invalid Id";
    FriendError["ACCEPTED"] = "Already friends";
    FriendError["PENDING"] = "Friendship in pending mod";
    FriendError["NO_LINK"] = "No relationship";
})(FriendError || (FriendError = {}));
export class FriendException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'FriendException';
    }
}
