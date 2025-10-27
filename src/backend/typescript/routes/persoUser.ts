import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UpdateData, UpdateResponse } from './dataStructure/usersStruct.js';
import { PersoProfileResponse } from './dataStructure/usersStruct.js';
import { updateSchema } from './schemas/schemaObject.js'
import { checkAuth } from './utils/JWTmanagement.js';
import { getUserById } from './DBRequests/users.js';
import { updateUser } from './utils/utils.js';

export async function persoRoutes(fastify: FastifyInstance) {
    // /perso/me
    fastify.get('/me', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = await getUserById(fastify, (request as any).user.userId);

            if (!user) {
                return reply.status(404).send({
                        success: false,
                        message: 'User not found'
                    } as PersoProfileResponse);
            }
            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user
            } as PersoProfileResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            } as PersoProfileResponse);
        }
    });

    // /perso/update
    fastify.put<{ Body: UpdateData }>('/update', { preHandler: checkAuth }, async (request: FastifyRequest<{ Body : UpdateData }>, reply: FastifyReply) => {

        try {
            const user = await getUserById(fastify, (request as any).user.userId);
            if (!user) {
                return reply.status(404).send({
                        success: false,
                        message: 'User not found'
                    } as UpdateResponse);
            }

            const validation = updateSchema.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'missing or invalid data',
                    redirectTo: '/perso/update'
                }as UpdateResponse);
            }

            const UpUser = await updateUser(fastify, validation.data, user);
            if (!UpUser.user) {
                return reply.status(409).send({
                    success: false,
                    message: UpUser.message,
                    redirectTo: '/perso/update'
                } as UpdateResponse)
            }

            reply.status(204).send({
                success: true,
                message: 'user update successful',
                redirectTo: '/perso/me'
            } as UpdateResponse);
        
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

}