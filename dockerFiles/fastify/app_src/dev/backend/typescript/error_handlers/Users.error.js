export var UsersError;
(function (UsersError) {
    UsersError["USER_NOT_FOUND"] = "User not found";
    UsersError["INVALID_ID"] = "Invalid Id format";
    UsersError["INVALID_NAME"] = "Invalid name format";
})(UsersError || (UsersError = {}));
export class UsersException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'SuscriberException';
    }
}
