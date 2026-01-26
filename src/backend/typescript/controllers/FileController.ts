import type { FastifyRequest } from 'fastify';
import { FileService } from '../services/FileService.js';
import { FileException, FileError } from '../error_handlers/FileHandler.error.js';
import { MAX_FILE_SIZE, ALLOWED_FILE_MIMES } from '../types/file.types.js';
import { fileTypeFromBuffer } from 'file-type';
import { ErrorWrapper } from '../error_handlers/ErrorWrapper.js';

export class FileController {
    constructor(
        private fileService: FileService,
    ){}
    private allowedMimes = ALLOWED_FILE_MIMES;

    // --------------------------------------------------------------------------------- //
    async normalizeAvatar(request: FastifyRequest): Promise<{ success: boolean, message?: string, buffer?: Buffer }> {
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
                return { success: false, message: result.message }
            
            return { success: true, buffer: result.buffer }

        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return {
                success: false,
                message: err.message,
            };
        }
    }
}
