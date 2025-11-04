import { FastifyRequest, FastifyReply } from "fastify";
import { SuscriberService, SuscriberError } from "../services/suscriberService";
import { SuscriberException } from "../error_handlers/suscriber.error.js";
import { updateSchema } from '../routes/schemas/schemaObject.js'

export class SuscriberController {
    constructor(
        private suscriberService: SuscriberService
    ) {}

    async me(request: FastifyRequest, reply: FastifyReply) {
        try {
            // check auth en amont donc id dans request
            const id = (request as any).user.userId;

            // retourne user sinon throw user not found
            const user =  await this.suscriberService.me(Number(id))

            return reply.status(200).send({
                success: true,
                message: 'Profile successfully retrieved',
                user
            });            
        } catch (error) {
            if (error.message === SuscriberError.USER_NOT_FOUND) {
                return reply.status(404).send({
                    success: false,
                    message: error.message
                });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            // check body
            const id = (request as any).user.userId;
            const validation = updateSchema.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'missing or invalid data',
                    redirectTo: '/suscriber/update'
                });
            }

            // appel service
            const user = this.suscriberService.update(id, validation.data);
    
            //reponse
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