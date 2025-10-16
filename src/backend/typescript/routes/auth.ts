import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, LoginRequest, authResponse, user } from '../API/auth.js';
import { validateRegisterData, isExistingUser, addUserInDB, findUser, verifyToken } from '../authUtils.js';

async function checkAuth(request: FastifyRequest, reply: FastifyReply) {

}

export async function authRoutes(fastify: FastifyInstance)
{ 
    fastify.post<{ Body: registerUser }>('/register', async (request: FastifyRequest<{ Body: registerUser }>, reply: FastifyReply) =>
    {
        try
        {
            const { username, email, password, avatar } = request.body ;

            const response = validateRegisterData(username, email, password);
            if (!response.success)
            {
                return reply.status(400).send({
                    success: false,
                    message: response.message
                } as authResponse);
            }

            // Check if user already exists in the DB
            // VERIFIER SI LE USERNAME EST DEJA UTILISE !!
            if (await isExistingUser(fastify, email))
            {
                return reply.status(400).send({
                    success: false,
                    message: 'A user with this email already exists'
                } as authResponse);
            }

            const newUser = await addUserInDB(username, email, password, avatar, fastify);

            return reply.status(201).send( {
                success: true,
                message: 'User registered successfully',
                user: {
                    id: newUser.id as number,
                    username,
                    email,
                    avatar: newUser.avatar
                },
                accesstoken: newUser.token
            } as authResponse);

        } catch (error) {
            fastify.log.error("Error registering new user:");
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            } as authResponse);
        }
    });

    // connection route
    fastify.post<{ Body: LoginRequest }>('/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
        try {
            const { identifier, password } = request.body;

            if (!identifier || !password) {
                return reply.status(401).send({
                    success: false,
                    message: 'Email or username and password are required'
                } as authResponse);
            }

            const userFound = await findUser(fastify, identifier, password);
            if (!userFound.user) {
                return reply.status(401).send({
                    success: false,
                    message: userFound.message
                } as authResponse);
            }
            else if (!userFound.accesstoken) {
                return reply.status(500).send({
                    success: false,
                    message: userFound.message
                } as authResponse);
            }
            else if (!userFound.validPass) {
                return reply.status(401).send( {
                    success: false,
                    message: userFound.message
                } as authResponse);
            }

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                user: {
                    id: userFound.user.id,
                    username: userFound.user.username,
                    email: userFound.user.email,
                    avatar: userFound.user.avatar
                },
                accesstoken: userFound.accesstoken
            } as authResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            } as authResponse);
        }
    });

    // Route to get user profile
    fastify.get('/profile', { preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
            // Middleware to check authentication token in the header
            const authHeader = request.headers.authorization;
            
            console.log(authHeader);

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({
                    success: false,
                    message: 'Missing authentication token'
                });
            }

            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            
            if (!decoded) {
                return reply.status(401).send({
                    success: false,
                    message: 'Token invalide'
                });
            }

            // Add user information to the query
            (request as any).user = decoded;
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { userId } = (request as any).user.userId;

            const user = await fastify.db.get<user>(
                'SELECT id, username, email, avatar FROM users WHERE id = ?',
                userId
            );

            if (!user) {
                return reply.status(400).send({
                    success: false,
                    message: 'User not found'
                } as authResponse);
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
            } as authResponse);

        } catch (error) {
            fastify.log.error('Error retrieving profile:');
            return reply.status(500).send({
                success: false,
                message: 'inernal server error'
            } as authResponse);
        }
    });
}
