export var SuscriberError;
(function (SuscriberError) {
    SuscriberError["BAD_FORMAT"] = "Data is not in the correct format";
    SuscriberError["USER_NOT_FOUND"] = "User not found";
    SuscriberError["USRNAME_ERROR"] = "Username must change";
    SuscriberError["PASSWD_ERROR"] = "Password must change";
    SuscriberError["INVALID_CREDENTIALS"] = "Invalid credentials";
    SuscriberError["AVATAR_ERROR"] = "Avatar must change";
    SuscriberError["USRNAME_ALREADY_USED"] = "This username is already used";
    SuscriberError["UPLOAD_ERROR"] = "Error uploading avatar";
})(SuscriberError || (SuscriberError = {}));
export class SuscriberException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'SuscriberException';
    }
}
