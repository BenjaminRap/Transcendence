import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, LoginRequest, authResponse, user } from '../API/auth.js';
import { hashPassword, comparePassword, generateToken, validateEmail, validatePassword } from '../auth.js';

/*
post :   registerUser
            -> validate data (all data is sended)
            -> validate data one by one (username, email, password)
*/

export async function authRoutes(fastify: FastifyInstance)
{ 
    // Route d'enregistrement
    // "/register"
    fastify.post<{ Body: registerUser }>('/register', async (request: FastifyRequest<{ Body: registerUser }>, reply: FastifyReply) =>
    {
        try
        {
            const username = request.body.username;
            const email = request.body.email;
            const password = request.body.password;
            const avatar = request.body.avatar;

            // validate data
            if (!username || !email || !password)
            {
                return reply.status(400).send( {
                    success: false,
                    message: 'all fields are required'
                } as authResponse);
            }

            // email validation
            if (!validateEmail(email)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Format d\'email invalide'
                } as authResponse);
            }

            // password validation
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: passwordValidation.message
                } as authResponse);
            }

            // Check if user already exists
            const existingUser = await fastify.db.get<user>(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUser) {
                return reply.status(409).send({
                    success: false,
                    message: 'A user with this email already exists'
                } as authResponse);
            }

            // Hash the password
            const hashedPassword = await hashPassword(password);

            // default avatar if not provided
            const userAvatar = avatar || '/https://www.freepik.com/free-vector/user-circles-set_145856997.htm#fromView=keyword&page=1&position=2&uuid=55abf82a-b233-47d9-a131-b2b90b06539b&query=Default+avatar';

            // insert the new user into the database
            const result = await fastify.db.run(
                'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, userAvatar]
            );

            // generate a jwt token
            const token = generateToken(result.lastID as number, email);

            return reply.status(201).send( {
                success: true,
                message: 'User registered successfully',
                user: {
                    id: result.lastID as number,
                    username,
                    email,
                    avatar: userAvatar
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
