import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, AuthError } from '../services/authService.js';
import { RegisterData, LoginData } from '../types/auth.types.js';

import { registerUserSchema } from '../validators/auth.validator.js';

export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    // --------------------------------------------------------------------------------- //
    async register(request: FastifyRequest<{ Body: RegisterData }>, reply: FastifyReply) {
        try {
            // Body validation
            const validation = registerUserSchema.safeParse(request.body);
            if (!validation.success) {
                return reply.status(400).send({
                    success: false,
                    message: validation.error.issues[0].message,
                });
            }

            // Checks if the user already exists; if not, creates it; returns sanitized user + tokens
            const result = await this.authService.register(request.body);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                ...result,
            });
        } catch (error) {
            if (error.message === AuthError.EMAIL_TAKEN ||
                error.message === AuthError.USERNAME_TAKEN) {
                return reply.status(409).send({
                    success: false,
                    message: error.message,
                });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    // --------------------------------------------------------------------------------- //
    async login(request: FastifyRequest<{ Body: LoginData }>, reply: FastifyReply) {
        try {
            // body validation
            const { identifier, password } = request.body;

            if (!identifier || !password) {
                return reply.status(400).send({
                    success: false,
                    message: 'Identifier and password are required',
                });
            }

            // Finds the user and generates the tokens, returns the sanitized user + tokens
            const result = await this.authService.login(identifier, password);

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                ...result,
            });
        } catch (error) {
            if (error.message === AuthError.INVALID_CREDENTIALS) {
                return reply.status(401).send({
                    success: false,
                    message: '"Invalid credentials"',
                });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    // --------------------------------------------------------------------------------- //
    async refresh(request: FastifyRequest, reply: FastifyReply) {
        try {
            // checkAuth en amont
            const user = (request as any).user;

            // check if user exist and generate new tokens
            const tokens = await this.authService.refreshTokens(user.userId, user.email);

            return reply.status(200).send({
                success: true,
                tokens,
                message: 'Authentication token renewal successful',
            });
        } catch (error) {
            if (error.message === AuthError.USR_NOT_FOUND) {
                return reply.status(404).send({
                    success: false,
                    message: "User not found",
                });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}

