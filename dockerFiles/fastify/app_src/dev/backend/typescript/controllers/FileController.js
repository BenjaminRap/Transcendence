import { FileService } from '../services/FileService.js';
import { FileException, FileError } from '../error_handlers/FileHandler.error.js';
import { MAX_FILE_SIZE, ALLOWED_FILE_MIMES } from '../types/file.types.js';
import { fileTypeFromBuffer } from 'file-type';
export class FileController {
    constructor(fileService) {
        this.fileService = fileService;
        this.allowedMimes = ALLOWED_FILE_MIMES;
    }
    // --------------------------------------------------------------------------------- //
    async normalizeAvatar(request) {
        try {
            // get file from request
            const data = await request.file({ limits: { fileSize: MAX_FILE_SIZE } });
            if (!data)
                throw new FileException(FileError.NO_FILE);
            // convert file to buffer
            const buffer = await data.toBuffer();
            // check the real mime type from buffer (magic number)
            const type = await fileTypeFromBuffer(buffer);
            if (!type || !this.allowedMimes.includes(type.mime))
                throw new FileException(FileError.BAD_FORMAT, 'the file content does not match the file extension');
            // check is the file is not corrupt (sharp), resize and convert to webp, return clean buffer
            const result = await this.fileService.normalizeAvatar(buffer);
            if (!result.success)
                return { success: false, message: result.message };
            return { success: true, buffer: result.buffer };
        }
        catch (error) {
            if (error instanceof FileException) {
                return {
                    success: false,
                    message: error.message || error.code,
                };
            }
            switch (error?.code) {
                case 'FST_REQ_FILE_TOO_LARGE':
                case 'FST_PARTS_LIMIT': {
                    return {
                        success: false,
                        message: 'File too large. Maximum size: 2 MB',
                    };
                }
                default: {
                    return {
                        success: false,
                        message: error?.message || 'Error loading file'
                    };
                }
            }
        }
    }
}
