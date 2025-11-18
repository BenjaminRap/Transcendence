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
            // the accessToken and tokenKey are already validated in the middleware

            // check if the newPassword and the confirmNewPassword are the same and the confirmChoice is true in the body
            const validation = SuscriberSchema.updatePassword.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/update/password'
                });
            }
            
            const userId = (request as any).user.userId;
            const password = request.body.newPassword;

            // check if user exists, if password is different then update or throw exception
            await this.suscriberService.updatePassword(userId, password);

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
    /**
     * cette fonction est la porte d'entree api pour update
     * gerer les header pour obliger les bon types mimes et le bon content ?
     * 
     * par ou passe l'image ?
     *  par body ?
     *  autre ?
     * quel est le type que je vais recevoir de la requete pour le fichier ?
     * 
     */
    async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = 0;//(request as any).user.userId;
            // console.log("REQUEST: ", request);
            
            // Récupérer le fichier via multipart
            const data = await request.file() ;

            console.log('FILE DATA: ', data);
            
            if (!data) {
                return reply.status(400).send({
                    success: false,
                    message: 'Empty File',
                    redirectTo: '/suscriber/update/avatar'
                });
            }

            // Vérifier le MIME type avant traitement
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedMimes.includes(data.mimetype)) {
                return reply.code(400).send({ 
                    success: false,
                    message: 'File format not allowed. Accept types : JPEG, PNG, WEBP',
                    redirectYo: '/suscriber/update/avatar'
                });
            }

            //  size double check after multipart
            const buffer = await data.toBuffer();
            if (buffer.length > 2 * 1024 * 1024) {
                return reply.code(400).send({ 
                    success: false,
                    message: 'File too big. Size max : 2 MB'
                });
            }

            // Appeler le service pour traiter l'upload
            const updatedUser = await this.suscriberService.updateAvatar(
                id,
                buffer,
                data.filename
            );




        } catch (error) {
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error',
                error: error
            });
            
        }
        // appel zodSchema

        
        // recuperer le fichier avec le plugin necessaire (multipart)
        
        // appel du service updateAvatar pour verif plus pousses et mis a jour avatar db + volume

        // reponse avec reply 
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
}
