import { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService } from "../services/SuscriberService.js";
import { SuscriberException, SuscriberError } from "../error_handlers/Suscriber.error.js";
import { SuscriberSchema } from "../schemas/suscriber.schema.js";

export class SuscriberController {
    constructor(
        private suscriberService: SuscriberService
    ) {}

    // ----------------------------------------------------------------------------- //
    // /suscriber/profile
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request as any).user.userId;

            // returns user or throw exception
            const user =  await this.suscriberService.getProfile(Number(id))

            return reply.status(200).send({
                success: true,
                message: 'Profile successfully retrieved',
                user
            });            
        } catch (error) {
            if (error instanceof SuscriberException) {
                switch (error.code) {
                    case SuscriberError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.code });
                    default:
                        return reply.status(409).send({ success: false, message: error.code, redirectTo: '/suscriber/update' });
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
    // suscriber/update
    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            // check body content & get id from auth middleware: checkAuth
            const id = (request as any).user.userId;
            const validation = SuscriberSchema.update.safeParse(request.body);
            if (!validation.success) {
                throw new SuscriberException(SuscriberError.BAD_FORMAT, SuscriberError.BAD_FORMAT);
            }

            // check data, user existence, mail and username availability then update and returns user or throw exception
            const user = this.suscriberService.updateProfile(id, validation.data);
    
            return reply.status(200).send({
                success: true,
                message: 'Profile successfully updated',
                redirectTo: '/suscriber/me',
                user

            });    
        } catch (error) {
            if (error instanceof SuscriberException) {
                switch (error.code) {
                    case SuscriberError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.code });
                    default:
                        return reply.status(409).send({ success: false, message: error.code, redirectTo: '/suscriber/update' });
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