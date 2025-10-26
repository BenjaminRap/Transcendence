import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthResponse, UpdateUser } from './dataStructure/auth.js';
import { updateSchema } from './schemas/authSchema.js';
import { checkAuth } from './utils/JWTmanagement.js'
import { getUserById } from './utils/DBRequest.js';

import { updateUser } from './utils/utils.js';

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

    });

    fastify.get('/search:username', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {

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
                    message: 'invalid data'
                }as AuthResponse);
            }

            // doit check si le username n'est pas deja utilise
            
            const UpUser = await updateUser(fastify, validation.data, user);
            if (!UpUser) {
                return reply.status(422).send({
                    success: false,
                    message: 'No changes detected: your new data must differ from your current information.'
                } as AuthResponse)
            }
            console.log("NEW USER : ", UpUser);

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
