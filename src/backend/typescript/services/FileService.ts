import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { FileException, FileError } from '../error_handlers/FileHandler.error.js';
import { SanitizedUser } from '../types/auth.types.js';
import fastify from 'fastify';
import { success } from 'zod';

export class FileService {
    constructor(){}

    // --------------------------------------------------------------------------------- //
    async uploadAvatar(buffer: Buffer, mimetype: string) {

//         // 4. TRAITEMENT DE L'IMAGE AVEC SHARP
//         // Redimensionnement + conversion en WebP pour optimisation
//         const processedBuffer = await sharp(fileBuffer)
//             .resize(400, 400, { 
//                 fit: 'cover', 
//                 position: 'center' 
//             })
//             .webp({ quality: 85 })
//             .toBuffer();

//         // 5. GÉNÉRATION D'UN NOM DE FICHIER UNIQUE
//         const filename = `avatar_${userId}_${Date.now()}.webp`;
//         const filepath = path.join(this.uploadDir, filename);

//         // 6. SUPPRESSION DE L'ANCIEN AVATAR (si existe)
//         const user = await this.userRepository.findById(userId);
//         if (user.avatar) {
//             const oldAvatarPath = path.join(this.uploadDir, path.basename(user.avatar));
//             try {
//                 await fs.unlink(oldAvatarPath);
//             } catch (error) {
//                 console.warn('Ancien avatar non trouvé ou déjà supprimé');
//             }
//         }

//         // 7. SAUVEGARDE DU NOUVEAU FICHIER
//         await fs.writeFile(filepath, processedBuffer);
    }

    // --------------------------------------------------------------------------------- //
    async updateAvatar(buffer: Buffer, ): Promise<{ success: boolean, message: string}> {
        try {
            const cleanBuffer = await sharp(buffer)
                .webp({ quality: 90 })
                .toBuffer();
            return {
                success: false,
                message: ''
            };


            return {
                success: true,
                message: ''
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Error: corrupt file',
            }
        }
        
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

