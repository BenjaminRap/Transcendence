import sharp from 'sharp';

export class FileService {
    constructor(){}

    private MAX_COMPRESSED_SIZE = 300 * 1024;

    // --------------------------------------------------------------------------------- //
    async uploadAvatar(buffer: Buffer) {
        try {
            // check if the file is not corrupt (sharp)
            const metadata = await sharp(buffer).metadata();
    
            // resize, convert to webp (compress lossless), return buffer
            const cleanBuffer = await sharp(buffer)
                .resize( 512, 512, { fit: 'cover', position: 'center', withoutEnlargement: true } )
                .webp({ quality: 90, lossless: true })
                .toBuffer();
    
            if (cleanBuffer.length > this.MAX_COMPRESSED_SIZE)
                console.warn('avatar too large detected, buffer size: ', (cleanBuffer.length / 1024).toFixed(2), " KB");
    
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
    async updateAvatar(buffer: Buffer) {
        
    }


    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
}


// export class FileService {
//     private uploadDir: string;
//     private userRepository: any; // Remplace par ton repository

//     constructor(uploadDir: string, userRepository: any) {
//         this.uploadDir = uploadDir;
//         this.userRepository = userRepository;
//     }

//     async updateAvatar(
//         userId: number, 
//         fileBuffer: Buffer, 
//         declaredMimetype: string,
//         originalFilename: string
//     ): Promise<SanitizedUser> {
        


//         // 8. MISE À JOUR DE LA BASE DE DONNÉES
//         const avatarUrl = `/uploads/${filename}`;
//         const updatedUser = await this.userRepository.update(userId, {
//             avatar: avatarUrl
//         });

//         // 9. RETOUR DE L'UTILISATEUR SANITISÉ
//         return this.sanitizeUser(updatedUser);
//     }

//     private sanitizeUser(user: any): SanitizedUser {
//         // Retire les données sensibles avant de retourner
//         const { password, ...sanitized } = user;
//         return sanitized as SanitizedUser;
//     }
// }

