import type { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService } from "../services/SuscriberService.js";
import { FileController } from "../controllers/FileController.js";
import type { UpdatePassword } from "../types/suscriber.types.js";
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import { SuscriberSchema } from "../schemas/suscriber.schema.js";

export class SuscriberController {
    constructor(
        private suscriberService: SuscriberService,
        private fileService: FileController
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
            // check if the newPassword and the confirmNewPassword are the same and respect password rules
            const validation = SuscriberSchema.updatePassword.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/updatepassword'
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
    // PUT /suscriber/update/username
    async updateUsername(request: FastifyRequest<{ Body: {username: string} }>, reply: FastifyReply) {
        try {          
            const id = (request as any).user.userId;
            const validation = SuscriberSchema.updateUsername.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input',
                    redirectTo: '/suscriber/updateprofile'
                });
            }

            // check data, user existence, mail and username availability then update and returns user or throw exception
            const user = await this.suscriberService.updateUsername(id, validation.data);
    
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

    // --------------------------------------------------------------------------------- //
    // PUT /suscriber/update/avatar
    async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = await this.fileService.normalizeAvatar(request);
            if (!data.success || !data.buffer) {
                return reply.status(400).send({
                    success: false,
                    message: data?.message || 'Error during avatar normalization',
                    redirectTo: '/suscriber/profile'
                });
            }

            const id = (request as any).user.userId;
            const updatedUser = await this.suscriberService.updateAvatar(data.buffer, Number(id));
            if (!updatedUser) {
                return reply.status(400).send({
                    success: false,
                    message: 'Could not update avatar',
                    redirectTo: '/suscriber/profile'
                });
            }
            return reply.status(200).send({
                success: true,
                message: 'Avatar successfully updated',
                redirectTo: '/suscriber/profile',
                user: updatedUser
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
                            redirectTo: '/suscriber/profile'
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
    // DELETE /suscriber/delete/avatar
    async deleteAvatar(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request as any).user.userId;

            // delete avatar or throw exception USER NOT FOUND
            await this.suscriberService.deleteAvatar(Number(id));

            return reply.status(204).send();

        } catch (error) {
            if (error instanceof SuscriberException) {
                if (error.code === SuscriberError.USER_NOT_FOUND)
                    return reply.status(404).send({ success: false, message: error.code });
                else
                    return reply.status(400).send({
                        success: false,
                        message: error.message || 'Unknow error',
                    });
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
    async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
        try {
            // the accessToken and tokenKey are already validated in the middleware
            const id = (request as any).user.userId;
            
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

    // ================================== PRIVATE ================================== //
}
