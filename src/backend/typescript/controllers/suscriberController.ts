import { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService, SuscriberError } from "../services/suscriberService";
import { SuscriberException } from "../error_handlers/suscriber.error.js";
import { updateSchema } from '../routes/schemas/schemaObject.js'

export class SuscriberController {
    constructor(
        private suscriberService: SuscriberService
    ) {}

    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            // get id from auth middleware: checkAuth
            const id = (request as any).user.userId;

            // get user or throw exception
            const user =  await this.suscriberService.getProfile(Number(id))

            return reply.status(200).send({
                success: true,
                message: 'Profile successfully retrieved',
                user
            });            
        } catch (error) {
            if (error instanceof SuscriberException) {
                if (error.code === SuscriberError.USER_NOT_FOUND)
                    return reply.status(404).send({ success: false, message: error.message });
                else
                    return reply.status(409).send({ success: false, message: error.message })
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            // check body content & get id from auth middleware: checkAuth
            const id = (request as any).user.userId;
            const validation = updateSchema.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'missing or invalid data',
                    redirectTo: '/suscriber/update'
                });
            }

            // check data and user existence then update and returns user or throw exception
            const user = this.suscriberService.updateProfile(id, validation.data);
    
            return reply.status(200).send({
                success: true,
                message: 'Profile successfully updated',
                redirectTo: '/suscriber/me',
                user

            });    
        } catch (error) {
            if (error instanceof SuscriberException) {
                if (error.code === SuscriberError.USER_NOT_FOUND)
                    return reply.status(404).send({ success: false, message: error.code });
                else
                    return reply.status(409).send({ success: false, message: error.code, redirectTo: '/suscriber/update' });
            }
            
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });            
        }
    }
}