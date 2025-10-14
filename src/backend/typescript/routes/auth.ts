import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, LoginRequest, authResponse, user } from '../API/auth.js';
import { comparePassword, generateToken, validateRegisterData, isExistingUser, addUserInDB } from '../authUtils.js';

export async function authRoutes(fastify: FastifyInstance)
{ 
    // Route d'enregistrement
    // "/register"
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

            // Check if user already exists
            if (isExistingUser(fastify, email))
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
                }
            } as authResponse);

        } catch (error) {
            fastify.log.error("Error while saving:");
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            } as authResponse);
        }
    });
    // connection route
    fastify.post<{ Body: LoginRequest }>('/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
        try {
            const { email, password } = request.body;

            // data validation
            if (!email || !password) {
                return reply.status(400).send({
                    success: false,
                    message: 'Email and password are required'
                } as authResponse);
            }

            // find user by email
            const user = await fastify.db.get<user>(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (!user) {
                return reply.status(401).send({
                    success: false,
                    message: 'Incorrect email or password'
                } as authResponse);
            }

            // Vérifier le mot de passe
            const isPasswordValid = await comparePassword(password, user.password);
            
            if (!isPasswordValid) {
                return reply.status(401).send({
                    success: false,
                    message: 'Incorrect email or password'
                } as authResponse);
            }

            // Générer un token JWT
            const token = generateToken(user.id, user.email);

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            } as authResponse);

        } catch (error) {
            fastify.log.error('Error while connection:');
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            } as authResponse);
        }
    });

    // Route to get user profile
    fastify.get('/profile', {    
        preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
            // Middleware to check authentication
            const authHeader = request.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({
                    success: false,
                    message: 'Missing authentication token'
                });
            }

            const token = authHeader.substring(7);
            const decoded = require('../auth.js').verifyToken(token);
            
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
            console.log('IN AUTH');

            const { userId } = (request as any).user.userId;

            const user = await fastify.db.get<user>(
                'SELECT id, username, email, avatar FROM users WHERE id = ?',
                [userId]
            );

            if (!user) {
                return reply.status(404).send({
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
