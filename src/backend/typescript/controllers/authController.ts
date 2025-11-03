import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/authService.js';
import { RegisterData, LoginData } from '../types/auth.types.js';

import { registerUserSchema } from '../validators/auth.validator.js';

export class AuthController {
    constructor(private authService: AuthService) {}

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

            // service call
            const result = await this.authService.register(request.body);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                ...result,
            });
        } catch (error) {
            if (error.message === 'User already exists') {
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

    async login(request: FastifyRequest<{ Body: LoginData }>, reply: FastifyReply) {
        try {
            // body validation
            const { identifier, password } = request.body;

            if (!identifier || !password) {
                return reply.status(400).send({
                    success: false,
                    message: 'Email or username and password are required',
                });
            }

            // service call
            const result = await this.authService.login(identifier, password);

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                ...result,
            });
        } catch (error) {
            if (error.message === 'Invalid credentials') {
                return reply.status(401)
                    .header('WWW-Authenticate', 'error="invalid_credentials"')
                    .send({
                        success: false,
                        message: 'Incorrect email/username or password',
                    });
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    async refresh(request: FastifyRequest, reply: FastifyReply) {
        try {
            // body validation & check if user exist
            const user = (request as any).user;
            const tokens = await this.authService.refreshTokens(user.userId, user.email);

            return reply.status(200).send({
                success: true,
                tokens,
                message: 'Authentication token renewal successful',
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}

