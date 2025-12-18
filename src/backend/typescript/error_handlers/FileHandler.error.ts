export enum FileError
{
	NO_FILE = 'No file provided',
    BAD_FORMAT = 'File format not allowed. Accepted: JPEG, PNG, WEBP',
	TOO_LARGE = 'File too large. Maximum size: 2 MB',
	INVALID_HEADER_TYPE = 'Invalid Content-Type. Must be: multipart/form-data',
    FILE_CORRUPT = 'File corrupted'

}

export class FileException extends Error {
    constructor(public code: FileError, message?: string) {
        super(message ?? code);
        this.name = 'FileException';
    }
}
