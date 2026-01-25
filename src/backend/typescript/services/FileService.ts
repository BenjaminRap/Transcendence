import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_AVATAR = "avatarDefault.webp"

export class FileService {
    constructor(){}

    private MAX_COMPRESSED_SIZE = 300 * 1024;
    private uploadDir = process.env.UPLOADS_DIR || '/app/uploads/';
    private avatarDir = process.env.AVATAR_DIR_PATH || path.join(this.uploadDir, 'avatars/');

    // --------------------------------------------------------------------------------- //
    async normalizeAvatar(buffer: Buffer): Promise<{ success: boolean; buffer?: Buffer; message?: string }> {
        try {
            // check if the file is not corrupt (sharp)
            await sharp(buffer).metadata();
    
            // resize, convert to webp (compress lossless), return buffer
            const cleanBuffer = await sharp(buffer)
                .resize( 512, 512, { fit: 'cover', position: 'center', withoutEnlargement: true } )
                .webp({ quality: 90, lossless: true })
                .toBuffer();
    
            if (cleanBuffer.length > this.MAX_COMPRESSED_SIZE)
                console.log('avatar too large detected, buffer size: ', (cleanBuffer.length / 1024).toFixed(2), " KB");
    
            return {
                success: true,
                buffer: cleanBuffer
            };
    
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Error: corrupt file',
            }
        }
    }

    // --------------------------------------------------------------------------------- //
    async uploadAvatarSafe(buffer: Buffer, userId: string): Promise<string> {
        const filename = `avatar_${userId}_${Date.now()}_${uuidv4()}.webp`;
        const finalPath = path.join(this.avatarDir, filename);

        const tmpFile = `${filename}.tmp`;
        const tmpPath = path.join(this.avatarDir, tmpFile);

        try {
            await fs.mkdir(this.avatarDir, { recursive: true });
            await fs.writeFile(tmpPath, buffer, { mode: 0o600 }); // rw------- (user only)
            await fs.rename(tmpPath, finalPath);
            
            return filename;
        } catch (error) {
            console.error('Error uploading avatar: ', error);

            try {
                await fs.unlink(tmpPath);
            } catch (error) {
                console.log(`Cannot delete ${tmpPath} : ${error}`);
            }

            try {
                await fs.unlink(finalPath);
            } catch (error) {
                console.log(`Cannot delete ${finalPath} : ${error}`);
            }
            return '';
        }
    }

    // --------------------------------------------------------------------------------- //
    async deleteAvatar(fileUrl: string): Promise<void> {
        const filename = path.basename(fileUrl);
        if (filename && filename != DEFAULT_AVATAR)
        {
            const filePath = path.join(this.avatarDir, filename);
            
            try {
                await fs.access(filePath);
                await fs.unlink(filePath);
            } catch (err : any) {
                if (err.code === 'ENOENT') {
                    console.log(`File not found: \"${filePath}\"`);
                } else {
                    console.log(`Failed to delete file: \"${filePath}\", err: `, err);
                }
            }
        }
    }
}
