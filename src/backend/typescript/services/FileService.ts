export class Fileservice {
    constructor(){}

    // --------------------------------------------------------------------------------- //
    async uploadAvatar(file: string) {

    }

    // --------------------------------------------------------------------------------- //
    async deleteAvatar(file: string) {
        
    }

    // --------------------------------------------------------------------------------- //
    async updateAvatar(file: string) {
        
    }


    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //

}

import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { SanitizedUser } from '../types/auth.types.js';

export class FileService {
    private uploadDir: string;
    private userRepository: any; // Remplace par ton repository

    constructor(uploadDir: string, userRepository: any) {
        this.uploadDir = uploadDir;
        this.userRepository = userRepository;
    }

    async updateAvatar(
        userId: number, 
        fileBuffer: Buffer, 
        declaredMimetype: string,
        originalFilename: string
    ): Promise<SanitizedUser> {
        
        // 1. VÉRIFICATION DU MAGIC NUMBER
        // Le "magic number" sont les premiers octets d'un fichier qui identifient son type réel
        // Cela empêche quelqu'un de renommer un .exe en .jpg par exemple
        const detectedType = await fileTypeFromBuffer(fileBuffer);

        console.log("DETECTED_TYPE: ", detectedType);
        
        if (!detectedType) {
            throw new Error('Format de fichier non reconnu');
        }

        // 2. VÉRIFICATION DE LA CORRESPONDANCE MIME TYPE
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(detectedType.mime)) {
            throw new Error(
                `Format de fichier invalide. Détecté: ${detectedType.mime}. ` +
                `Formats acceptés: JPEG, PNG, WEBP`
            );
        }

        // 3. VÉRIFICATION MIME DÉCLARÉ VS RÉEL
        if (declaredMimetype !== detectedType.mime) {
            console.warn(
                `Avertissement: MIME déclaré (${declaredMimetype}) ` +
                `différent du MIME réel (${detectedType.mime})`
            );
        }

        // 4. TRAITEMENT DE L'IMAGE AVEC SHARP
        // Redimensionnement + conversion en WebP pour optimisation
        const processedBuffer = await sharp(fileBuffer)
            .resize(400, 400, { 
                fit: 'cover', 
                position: 'center' 
            })
            .webp({ quality: 85 })
            .toBuffer();

        // 5. GÉNÉRATION D'UN NOM DE FICHIER UNIQUE
        const filename = `avatar_${userId}_${Date.now()}.webp`;
        const filepath = path.join(this.uploadDir, filename);

        // 6. SUPPRESSION DE L'ANCIEN AVATAR (si existe)
        const user = await this.userRepository.findById(userId);
        if (user.avatar) {
            const oldAvatarPath = path.join(this.uploadDir, path.basename(user.avatar));
            try {
                await fs.unlink(oldAvatarPath);
            } catch (error) {
                console.warn('Ancien avatar non trouvé ou déjà supprimé');
            }
        }

        // 7. SAUVEGARDE DU NOUVEAU FICHIER
        await fs.writeFile(filepath, processedBuffer);

        // 8. MISE À JOUR DE LA BASE DE DONNÉES
        const avatarUrl = `/uploads/${filename}`;
        const updatedUser = await this.userRepository.update(userId, {
            avatar: avatarUrl
        });

        // 9. RETOUR DE L'UTILISATEUR SANITISÉ
        return this.sanitizeUser(updatedUser);
    }

    private sanitizeUser(user: any): SanitizedUser {
        // Retire les données sensibles avant de retourner
        const { password, ...sanitized } = user;
        return sanitized as SanitizedUser;
    }
}

