import { FastifyRequest } from 'fastify';
import { FileService } from '../services/FileService.js';
import { FileException, FileError } from '../error_handlers/FileHandler.error.js';
import { FileResponse, MAX_FILE_SIZE, ALLOWED_FILE_MIMES } from '../types/file.types.js';
import { fileTypeFromBuffer, fileTypeFromFile } from 'file-type';

export class FileController {
    constructor(
        private fileService: FileService,
    ){}
    private allowedMimes = ALLOWED_FILE_MIMES;

    // --------------------------------------------------------------------------------- //
    async uploadAvatar(request: FastifyRequest): Promise<FileResponse> {
        try {
            // Récupérer le fichier via multipart
            const data = await request.file({ limits: { fileSize: MAX_FILE_SIZE } });
            if (!data)
                throw new FileException(FileError.NO_FILE);

            // verifier le type mime envoye par le client
            if ( !this.allowedMimes.includes(data.mimetype) )
                throw new FileException(FileError.BAD_FORMAT, FileError.BAD_FORMAT);

            // convertir en buffer
            const buffer = await data.toBuffer();

            // verifie le type mime reel du fichier (magic number)
            let type = await fileTypeFromBuffer(buffer);
            if (!type || !this.allowedMimes.includes(type.mime)) {
                throw new FileException(FileError.BAD_FORMAT, 'the file content does not match the file extension');
            }

            // verifie que le fichier n'est pas corrompu (sharp)
            // 
            const result = await this.fileService.updateAvatar(buffer);
            if (!result.success) {
                return {
                    success: false,
                    message: result.message
                }
            }

            return {
                success: true,
                // buffer
            }

        } catch (error) {
            if (error instanceof FileException) {
                return {
                    success: false,
                    message: error.message || error.code,
                };
            }
            console.log("HERE");
            
            // Gérer les erreurs Fastify
            switch ((error as any)?.code) {
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
                        message: (error as any)?.message || 'Error loading file'
                    };
                }
            }
        }
    }



    // --------------------------------------------------------------------------------- //
    async updateAvatar(file: string) {

    }

}

// import { FastifyRequest, FastifyReply } from 'fastify';
// import { FileService } from '../services/FileService.js';
// import { z } from 'zod';

// // Schema Zod pour la validation
// const avatarSchema = z.object({
//     avatar: z.any() // On validera manuellement car multipart gère différemment
// });

// export class FileController {
//     constructor(
//         private fileService: FileService
//     ) {}

//     // PUT /subscriber/update/avatar
//     async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
//         try {
//             // Vérifier l'authentification
//             const id = (request as any).user.userId;

//             // Récupérer le fichier via multipart
//             const data = await request.file();
            
//             if (!data) {
//                 return reply.code(400).send({ error: 'Aucun fichier fourni' });
//             }

//             // Vérifier le MIME type avant traitement
//             const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
//             if (!allowedMimes.includes(data.mimetype)) {
//                 return reply.code(400).send({ 
//                     error: 'Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WEBP' 
//                 });
//             }

//             // Vérifier la taille (déjà fait par multipart mais double vérification)
//             const buffer = await data.toBuffer();
//             if (buffer.length > 2 * 1024 * 1024) {
//                 return reply.code(400).send({ 
//                     error: 'Fichier trop volumineux. Taille maximale : 2 MB' 
//                 });
//             }

//             // Appeler le service pour traiter l'upload
//             const updatedUser = await this.fileService.updateAvatar(
//                 id,
//                 buffer,
//                 data.mimetype,
//                 data.filename
//             );

//             return reply.code(200).send({
//                 message: 'Avatar mis à jour avec succès',
//                 user: updatedUser
//             });

//         } catch (error: any) {
//             console.error('Erreur lors de l\'upload de l\'avatar:', error);
            
//             if (error.message.includes('Format')) {
//                 return reply.code(400).send({ error: error.message });
//             }
            
//             return reply.code(500).send({ 
//                 error: 'Erreur lors de la mise à jour de l\'avatar' 
//             });
//         }
//     }
// }

