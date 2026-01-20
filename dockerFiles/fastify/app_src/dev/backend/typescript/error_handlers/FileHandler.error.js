export var FileError;
(function (FileError) {
    FileError["NO_FILE"] = "No file provided";
    FileError["BAD_FORMAT"] = "File format not allowed. Accepted: JPEG, PNG, WEBP";
    FileError["TOO_LARGE"] = "File too large. Maximum size: 2 MB";
    FileError["INVALID_HEADER_TYPE"] = "Invalid Content-Type. Must be: multipart/form-data";
    FileError["FILE_CORRUPT"] = "File corrupted";
})(FileError || (FileError = {}));
export class FileException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'FileException';
    }
}
