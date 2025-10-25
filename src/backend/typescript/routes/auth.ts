import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUser, LoginRequest, AuthResponse} from '../data_structure/auth.js';
import { isExistingUser, addUserInDB, findUser } from './utils/utils.js'
import { generateToken, checkAuth } from './utils/JWTmanagement.js'
import { userSchema } from './schemas/authSchema.js'

export async function authRoutes(fastify: FastifyInstance)
{
    // /auth/register
    fastify.post<{ Body: RegisterUser }>('/register', async (request: FastifyRequest<{ Body: RegisterUser }>, reply: FastifyReply) =>
    {
        try
        {
            const requiredData = { 
                username: request.body.username,
                password: request.body.password,
                email: request.body.email,
            };

            const response = userSchema.safeParse(requiredData);
            if (!response.success)
            {
                return reply.status(400).send({
                    success: false,
                    message: response.error.issues[0].message
                } as AuthResponse);
            }

            if (await isExistingUser(fastify, requiredData.email, requiredData.username))
            {
                return reply.status(401).send({
                    success: false,
                    message: 'A user with this email or username already exists'
                } as AuthResponse);
            }

            (requiredData as RegisterUser).avatar = request.body.avatar;

            const newUser = await addUserInDB((requiredData as RegisterUser), fastify);

            return reply.status(201).send( {
                success: true,
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: requiredData.username,
                    email: requiredData.email,
                    avatar: newUser.avatar
                },
                tokens: {
                    token: newUser.tokens.token ,
                    refresh_token: newUser.tokens.refresh_token
                }
            } as AuthResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            } as AuthResponse);
        }
    });

    // /auth/login
    fastify.post<{ Body: LoginRequest }>('/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
        try
        {
            const { identifier, password } = request.body;

            if (!identifier || !password) {
                return reply.status(400).send({
                    success: false,
                    message: 'Email or username and password are required'
                } as AuthResponse);
            }

            const userFound = await findUser(fastify, identifier, password);
            if (!userFound.user || !userFound.validPass) {
                return reply.status(401).send({
                    success: false,
                    message: userFound.message
                } as AuthResponse);
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
                tokens: {
                    token: userFound.tokens.token,
                    refresh_token: userFound.tokens.refresh_token
                }
            } as AuthResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            } as AuthResponse);
        }
    });

    // auth/refresh
    fastify.get('/refresh', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {

        const tokens = generateToken((request as any).user.lastID, (request as any).user.email);
        return reply.status(201).send({
            tokens: {
                token: (await tokens).token,
                refresh_token: (await tokens).refresh_token
            },
            message: "Authentification token renewal successful"
        });
    });
}
