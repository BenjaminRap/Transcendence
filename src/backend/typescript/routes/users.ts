import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthResponse, UpdateUser } from './dataStructure/auth.js';
import { updateSchema } from './schemas/authSchema.js';
import { checkAuth } from './utils/JWTmanagement.js'
import { getUserById } from './DBRequests/users.js';

import { updateUser } from './utils/utils.js';
import { idParamSchema } from './schemas/commonSchema.js';
import { success } from 'zod';

// /users/me
export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/me', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = await getUserById(fastify, (request as any).user.userId);

            if (!user) {
                return reply.status(404).send({
                        success: false,
                        message: 'User not found'
                    } as AuthResponse);
            }
            // renvoyer userid username, avatar
            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user
            } as AuthResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'inernal server error'
            } as AuthResponse);
        }
    });

    // /users/:id
    fastify.get('/:id', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        const idData = idParamSchema.safeParse(request.params['id']);
        if (!idData.success) {
            return reply.status(400).send({
                success: false,
                message: 'invalid ID'
            } as AuthResponse);
        }

        const user = await getUserById(fastify, idData.data);
        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'User not found'
            }  as AuthResponse);
        }
        console.log('USER FOUNDED: ', user);
    });

    fastify.get('/search/:username', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        
    });


    // /users/update
    fastify.put<{ Body: UpdateUser }>('/update', { preHandler: checkAuth }, async (request: FastifyRequest<{ Body : UpdateUser }>, reply: FastifyReply) => {

        try {
            const user = await getUserById(fastify, (request as any).user.userId);
            if (!user) {
                return reply.status(404).send({
                        success: false,
                        message: 'User not found'
                    } as AuthResponse);
            }

            const validation = updateSchema.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'missing or invalid data'
                }as AuthResponse);
            }

            const UpUser = await updateUser(fastify, validation.data, user);
            if (!UpUser.user) {
                return reply.status(422).send({
                    success: false,
                    message: UpUser.message
                } as AuthResponse)
            }

            reply.status(204).send({
                success: true,
                message: 'user update successful',
                user
            } as AuthResponse);
        
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: "Internal Server Error"
            });
        }
    });
}
