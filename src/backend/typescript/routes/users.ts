import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthResponse, UpdateUser } from '../data_structure/auth.js';
import { checkAuth } from './utils/JWTmanagement.js'
import { updateUser } from './utils/utils.js';
import { updateSchema } from './schemas/authSchema.js';

// /users/me
export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/me', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userMail  = (request as any).user.email;

            const user = await fastify.prisma.user.findUnique({
                where: {
                    email: userMail
                }
            });

            if (!user) {
                return reply.status(401).send({
                    success: false,
                    message: 'User not found'
                } as AuthResponse);
            }

            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            } as AuthResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'inernal server error'
            } as AuthResponse);
        }
    });

    // /users/update
    fastify.put<{ Body: UpdateUser }>('/update', { preHandler: checkAuth }, async (request: FastifyRequest<{ Body : UpdateUser }>, reply: FastifyReply) => {

        try {
            const userEmail = (request as any).user.email;
            const updateData: UpdateUser = request.body;

            const newData = updateSchema.safeParse(updateData);
            if (!newData.success)
            {
                
            }
            updateUser(fastify, updateData, userEmail);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: "Internal Server Error"
            });
        }
    });
}
