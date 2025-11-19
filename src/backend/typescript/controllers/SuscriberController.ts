import { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService } from "../services/SuscriberService.js";
import { UpdatePassword, DeleteAccount } from "../types/suscriber.types.js";
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import { SuscriberSchema } from "../schemas/suscriber.schema.js";

export class SuscriberController {
    constructor(
        private suscriberService: SuscriberService,
    ) {}

    // ----------------------------------------------------------------------------- //
    // GET /suscriber/profile
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request as any).user.userId;

            // returns user or throw exception USER NOT FOUND
            const user =  await this.suscriberService.getProfile(Number(id))

            return reply.status(200).send({
                success: true,
                message: 'Profile successfully retrieved',
                user
            });            
        } catch (error) {
            if (error instanceof SuscriberException) {
                if (error.code === SuscriberError.USER_NOT_FOUND)
                    return reply.status(404).send({ success: false, message: error.code });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // PUT /suscriber/update/password
    async updatePassword(request: FastifyRequest<{ Body: UpdatePassword }>, reply: FastifyReply) {
        try {
            // check if the newPassword and the confirmNewPassword are the same
            const validation = SuscriberSchema.updatePassword.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/update/password'
                });
            }
            
            const userId = (request as any).user.userId;
            const { newPassword, currentPassword } = request.body;

            // check if user exists, if password is different then hash and update or throw exception
            await this.suscriberService.updatePassword(userId, currentPassword, newPassword);

            return reply.status(204).send();

        } catch (error) {
            if (error instanceof SuscriberException) {
                switch (error.code) {
                    case SuscriberError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(409).send({
                            success: false,
                            message: error.message,
                            redirectTo: '/suscriber/update/password'
                        });
                }
            }
            
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // PUT /suscriber/update/username
    async updateUsername(request: FastifyRequest<{ Body: { username: string } }>, reply: FastifyReply) {
        try {          
            const id = (request as any).user.userId;
            const validation = SuscriberSchema.updateUsername.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/update/username'
                });
            }

            // check data, user existence, mail and username availability then update and returns user or throw exception
            const user = await this.suscriberService.updateUsername(id, validation.data.username);
    
            return reply.status(200).send({
                success: true,
                message: 'Profile successfully updated',
                redirectTo: '/suscriber/profile',
                user
            }); 
        } catch (error) {
            if (error instanceof SuscriberException) {
                switch (error.code) {
                    case SuscriberError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.code });
                    default:
                        return reply.status(409).send({
                            success: false,
                            message: error.message,
                            redirectTo: '/suscriber/update/username'
                        });
                }
            }
            
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });            
        }
    }

    // --------------------------------------------------------------------------------- //
    // PUT /suscriber/update/avatar
    async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
        try {            
            // Récupérer le fichier via multipart
            // IMPORTANT: le client doit envoyer Content-Type: multipart/form-data
            let data;
            try {
                data = await request.file();
                if (!data) {
                    return reply.status(400).send({
                        success: false,
                        message: 'No file provided',
                        redirectTo: '/suscriber/update/avatar'
                    });
                }
                console.log('File received:', data.filename, data.mimetype);
            } catch (multipartError: any) {
                request.log.error(multipartError);
                switch (multipartError.code) {
                    case 'FST_INVALID_MULTIPART_CONTENT_TYPE': {
                        return reply.status(400).send({
                            success: false,
                            message: 'Invalid Content-Type. Must be: multipart/form-data',
                            redirectTo: '/suscriber/update/avatar'
                        });
                    }
                    case 'FST_PARTS_LIMIT': {
                        return reply.status(413).send({
                            success: false,
                            message: 'File too large. Maximum size: 2 MB',
                            redirectTo: '/suscriber/update/avatar'
                        });
                    }
                    default: {
                        return reply.status(400).send({
                            success: false,
                            message: 'Error processing file upload',
                            redirectTo: '/suscriber/update/avatar'
                        });
                    }
                }                
            }

            // Vérifier le MIME type avant traitement
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedMimes.includes(data.mimetype)) {
                return reply.status(400).send({ 
                    success: false,
                    message: 'File format not allowed. Accepted: JPEG, PNG, WEBP',
                    redirectTo: '/suscriber/update/avatar'
                });
            }

            // Vérifier la taille du fichier
            const buffer = await data.toBuffer();
            if (buffer.length > 2 * 1024 * 1024) {
                return reply.status(413).send({ 
                    success: false,
                    message: 'File too large. Maximum size: 2 MB',
                    redirectTo: '/suscriber/update/avatar'
                });
            }

            const id = 10;//(request as any).user.userId; -> comme ca pour tests
            // Appeler le service pour traiter l'upload
            const updatedUser = await this.suscriberService.updateAvatar(
                id,
                buffer,
                data.filename
            );
            

            return reply.status(200).send({
                success: true,
                message: 'Avatar successfully updated',
                redirectTo: '/suscriber/profile',
                user: updatedUser
            });

        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // DELETE /suscriber/deleteaccount
    async deleteAccount(request: FastifyRequest<{ Body: DeleteAccount }>, reply: FastifyReply) {
        try {
            // the accessToken and tokenKey are already validated in the middleware
            const id = (request as any).user.userId;
            
            if (!request.body.confirmChoice) {
                return reply.status(400).send({
                    success: false,
                    message: 'Account deletion not confirmed',
                    redirectTo: '/suscriber/profile'
                });
            }

            // delete user or throw exception USER NOT FOUND
            await this.suscriberService.deleteAccount(Number(id));

            return reply.status(204).send();

        } catch (error) {
            if (error instanceof SuscriberException) {
                if (error.code === SuscriberError.USER_NOT_FOUND)
                    return reply.status(404).send({ success: false, message: error.code });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // GET /suscriber/getstats
    async getStats(request: FastifyRequest, reply: FastifyReply) {
        try {
            // the access token is validated in the middleware
            const id = (request as any).user.userId;

            // returns user stats or throw exception USER NOT FOUND
            const stats =  await this.suscriberService.getStats(Number(id))

            return reply.status(200).send({
                success: true,
                message: 'Stats successfully retrieved',
                stats
            });            
        } catch (error) {
            if (error instanceof SuscriberException) {
                switch (error.code) {
                    case SuscriberError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.code });
                    default:
                        return reply.status(400).send({
                            success: false,
                            message: error.message || 'Unknow error',
                        });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ================================== PRIVATE ================================== //
}
