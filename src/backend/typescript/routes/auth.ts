import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getExistingUser } from './utils/auth.utils.js'
import { registerUserSchema } from './schemas/schemaObject.js'
import { createUser, isExistingUser } from './utils/auth.utils.js'
import { generateToken, checkAuth } from './utils/JWTmanagement.js'
import { RegisterData, LoginData, AuthResponse, sanitizeUser} from './dataStructure/authStruct.js';

export async function authRoutes(fastify: FastifyInstance)
{
    // /auth/register
    fastify.post<{ Body: RegisterData }>('/register', async (request: FastifyRequest<{ Body: RegisterData }>, reply: FastifyReply) =>
    {
        try
        {
            const requiredData = {
                username: request.body.username,
                password: request.body.password,
                email: request.body.email,
            };

            const response = registerUserSchema.safeParse(requiredData);
            if (!response.success) {
                return reply.status(400).send({
                    success: false,
                    message: response.error.issues[0].message
                } as AuthResponse);
            }

            const isExist = await isExistingUser(fastify, requiredData.email, requiredData.username); 
            if (isExist.alreadyExist) {
                return reply.status(409).send({
                    success: false,
                    message: isExist.message
                } as AuthResponse);
            }

            // schema avatar VOIR SI ON GARDE LIEN HTTP OU UNE IMAGE .PNJ etc...
            (requiredData as RegisterData).avatar = request.body.avatar;

            const newUser = await createUser((requiredData as RegisterData), fastify);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                user: sanitizeUser(newUser.user),
                tokens: newUser.tokens
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
    fastify.post<{ Body: LoginData }>('/login', async (request: FastifyRequest<{ Body: LoginData }>, reply: FastifyReply) => {
        try
        {
            const { identifier, password } = request.body;
            if (!identifier || !password) {
                return reply.status(400).send({
                    success: false,
                    message: 'Email or username and password are required'
                } as AuthResponse);
            }

            const userFound = await getExistingUser(fastify, identifier, password);
            if (!userFound.user || !userFound.tokens) {
                return reply.status(401)
                    .header('WWW-Authenticate', 'error="invalid_credentials"')
                    .send({
                        success: false,
                        message: 'Incorrect email/username or password'
                    } as AuthResponse);
            }

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                user: sanitizeUser(userFound.user),
                tokens: userFound.tokens
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

        const tokens = await generateToken((request as any).user.userId, (request as any).user.email);
        return reply.status(201).send({
            tokens,
            message: "Authentification token renewal successful"
        });
    });
    fastify.get('/dbuser', async (request: FastifyRequest, reply: FastifyReply) => {
        console.log(await fastify.prisma.user.findMany());
    });
}
