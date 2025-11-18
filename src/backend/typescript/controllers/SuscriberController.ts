import { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService } from "../services/SuscriberService.js";
import { UpdateData, UpdatePassword, DeleteAccount } from "../types/suscriber.types.js";
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
    // PUT /suscriber/updatepassword
    async updatePassword(request: FastifyRequest<{ Body: UpdatePassword }>, reply: FastifyReply) {
        try {
            // the accessToken and tokenKey are already validated in the middleware

            // check if the newPassword and the confirmNewPassword are the same and the confirmChoice is true in the body
            const validation = SuscriberSchema.updatePassword.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/updatepassword'
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
                            redirectTo: '/suscriber/updatepassword'
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
    // PUT /suscriber/updateprofile
    async updateProfile(request: FastifyRequest<{ Body: UpdateData }>, reply: FastifyReply) {
        try {          
            const id = (request as any).user.userId;
            const validation = SuscriberSchema.update.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/updateprofile'
                });
            }

            // check data, user existence, mail and username availability then update and returns user or throw exception
            const user = await this.suscriberService.updateProfile(id, validation.data);
    
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
                            redirectTo: '/suscriber/updateprofile'
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
