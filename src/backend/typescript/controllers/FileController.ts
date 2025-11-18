export class Filecontroller {
    constructor(){}

    // --------------------------------------------------------------------------------- //
    /*
        la fonction suivante a pour but d'upload une image pour l'avatar de l'utilisateur

        

    */
    async uploadAvatar(file: string) {

    }

    // --------------------------------------------------------------------------------- //
    async deleteAvatar(file: string) {

    }

    // --------------------------------------------------------------------------------- //
    async updateAvatar(file: string) {

    }


    

}

import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../services/FileService.js';
import { z } from 'zod';

// Schema Zod pour la validation
const avatarSchema = z.object({
    avatar: z.any() // On validera manuellement car multipart gère différemment
});

export class FileController {
    constructor(
        private fileService: FileService
    ) {}

    // PUT /subscriber/update/avatar
    async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Vérifier l'authentification
            const id = (request as any).user.userId;

            // Récupérer le fichier via multipart
            const data = await request.file();
            
            if (!data) {
                return reply.code(400).send({ error: 'Aucun fichier fourni' });
            }

            // Vérifier le MIME type avant traitement
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedMimes.includes(data.mimetype)) {
                return reply.code(400).send({ 
                    error: 'Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WEBP' 
                });
            }

            // Vérifier la taille (déjà fait par multipart mais double vérification)
            const buffer = await data.toBuffer();
            if (buffer.length > 2 * 1024 * 1024) {
                return reply.code(400).send({ 
                    error: 'Fichier trop volumineux. Taille maximale : 2 MB' 
                });
            }

            // Appeler le service pour traiter l'upload
            const updatedUser = await this.fileService.updateAvatar(
                id,
                buffer,
                data.mimetype,
                data.filename
            );

            return reply.code(200).send({
                message: 'Avatar mis à jour avec succès',
                user: updatedUser
            });

        } catch (error: any) {
            console.error('Erreur lors de l\'upload de l\'avatar:', error);
            
            if (error.message.includes('Format')) {
                return reply.code(400).send({ error: error.message });
            }
            
            return reply.code(500).send({ 
                error: 'Erreur lors de la mise à jour de l\'avatar' 
            });
        }
    }
}

