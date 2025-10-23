import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthResponse, UpdateUser } from '../data_structure/auth.js';
import { checkAuth } from './utils/JWTmanagement.js'

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
        // route pour modifier les infos de l'utilisateur dans la db
        const { username, password, avatar } = request.body;

        if (!username && !password && !avatar)
        {
            return reply.status(400).send({
                success: false,
                message: "The request does not contain any data to be updated"
            });
        }
        
        const userID = (request as any).user.userId;

        try {

            if (username)
            {
                // check SQLi
                // check username validity
                // change the username in the DB
            }
            if (password)
            {
                // check SQLi
                // check password validity
                // hash password
                // change the password in the DB
            }
            
            if (avatar)
            {
                // check SQLi
                // change avatar in the DB
            }            
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: "Internal Server Error"
            });
        }
    });
}