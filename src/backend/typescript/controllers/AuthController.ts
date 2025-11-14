import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import { RegisterData, LoginData } from '../types/auth.types.js';
import { AuthException, AuthError } from '../error_handlers/Auth.error.js';
import { AuthSchema } from '../schemas/auth.schema.js';
import { CommonSchema } from '../schemas/common.schema.js';

export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    // --------------------------------------------------------------------------------- //
    // auth/register
    async register(request: FastifyRequest<{ Body: RegisterData }>, reply: FastifyReply) {
        try {
            /*  - Check presence and the syntax of all these fields
                    .username
                    .password
                    .email
            */
           const requiredData = {
                username: request.body.username,
                password: request.body.password,
                email: request.body.email,
            };
            const validation = AuthSchema.register.safeParse(requiredData);
            if (!validation.success)
                return reply.status(400).send({ success: false, message: validation.error.message });

            // Checks if the user already exists; if not, creates it; returns sanitized user + tokens
            const result = await this.authService.register(validation.data as RegisterData);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                ...result,
            });
        } catch (error) {
            if (error instanceof AuthException) {
                return reply.status(409).send({ success: false, message: error.message });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    // --------------------------------------------------------------------------------- //
    // auth/login
    async login(request: FastifyRequest<{ Body: LoginData }>, reply: FastifyReply) {
        try {
            // Check if the fields are not empty and verify the password format
            const requiredData = {
                identifier: request.body.identifier,
                password: request.body.password,
            };
            const validation = AuthSchema.login.safeParse(requiredData);
            if (!validation.success)
                return reply.status(400).send({ success: false, message: validation.error.message });

            // Check if the username or email address is in the correct format
            if (!CommonSchema.email.safeParse(validation.data.identifier).success &&
                !CommonSchema.username.safeParse(validation.data.identifier).success) {
                throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Bad email or username format');
            }

            // Finds the user and generates the tokens, returns the sanitized user + tokens
            const result = await this.authService.login(validation.data.identifier, validation.data.password);

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                ...result,
            });
        } catch (error) {
            if (error instanceof AuthException) {
                return reply.status(401).send({ success: false, message: error.message });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    // --------------------------------------------------------------------------------- //
    // auth/refresh
    async refresh(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;

            // check if user exist and generate new tokens
            const tokens = await this.authService.refreshTokens(user.userId, user.email);

            return reply.status(200).send({
                success: true,
                message: 'Authentication token renewal successful',
                tokens,
            });
        } catch (error) {
            if (error instanceof AuthException) {
                return reply.status(404).send({ success: false, message: "User not found", });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}

