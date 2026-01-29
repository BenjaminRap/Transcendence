import type { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService } from "../services/SuscriberService.js";
import { FileController } from "../controllers/FileController.js";
import type { UpdatePassword } from "../types/suscriber.types.js";
import { SuscriberSchema } from "../schemas/suscriber.schema.js";
import { SocketEventController } from "./SocketEventController.js";
import { sanitizeUser } from "../types/auth.types.js";
import { ErrorWrapper } from "../error_handlers/ErrorWrapper.js";

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
            const user =  await this.suscriberService.getProfile(Number(id));

            return reply.status(200).send({
                success: true,
                message: 'Profile successfully retrieved',
                user
            });            
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // GET /suscriber/profile/allmatches
    async getAllMatches(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request as any).user.userId;

            // returns user or throw exception USER NOT FOUND
            const matches =  await this.suscriberService.getAllMatches(Number(id));

            return reply.status(200).send({
                success: true,
                message: 'Matches successfully retrieved',
                matches
            });            
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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
                    redirectTo: '/suscriber/update/password'
                });
            }
            
            const userId = (request as any).user.userId;
            const { newPassword, currentPassword } = validation.data;
            
            // check if user exists, if password is different then hash and update or throw exception
            await this.suscriberService.updatePassword(userId, currentPassword, newPassword);

            return reply.status(200).send({
                success: true
            });

        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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
                    redirectTo: '/suscriber/update/profile'
                });
            }

            // check data, user existence, username availability then update and returns user or throw exception
            const user = await this.suscriberService.updateUsername(id, validation.data.username);

            SocketEventController.notifyProfileChange(Number(id), 'profile-update', { user: sanitizeUser(user) });
            
            return reply.status(200).send({
                success: true,
                message: 'Profile successfully updated',
                redirectTo: '/suscriber/profile',
                user: sanitizeUser(user)
            }); 
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
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

            SocketEventController.notifyProfileChange(Number(id), 'profile-update', { user: updatedUser });

            return reply.status(200).send({
                success: true,
                message: 'Avatar successfully updated',
                redirectTo: '/suscriber/profile',
                user: updatedUser
            });

        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // DELETE /suscriber/delete/avatar
    async deleteAvatar(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request as any).user.userId;

            // delete avatar or throw exception USER NOT FOUND
            const user = await this.suscriberService.deleteAvatar(Number(id));

            SocketEventController.notifyProfileChange(Number(id), 'profile-update', { user });

            return reply.status(204).send();

        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // DELETE /suscriber/deleteaccount
    async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request as any).user.userId;
            
            // delete user or throw exception USER NOT FOUND
            await this.suscriberService.deleteAccount(Number(id));

            // envoyer un event a la room 'user-{id}' pour que tous les processus front se deconnectent
            SocketEventController.notifyProfileChange(Number(id), 'account-deleted');

            return reply.status(204).send();

        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }
}
