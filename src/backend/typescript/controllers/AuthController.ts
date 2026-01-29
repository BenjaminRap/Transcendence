import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import type { RegisterData, LoginData, VerifData } from '../types/auth.types.js';
import { AuthException, AuthError } from '../error_handlers/Auth.error.js';
import { AuthSchema } from '../schemas/auth.schema.js';
import { CommonSchema } from '@shared/common.schema';
import { ErrorWrapper } from '../error_handlers/ErrorWrapper.js';

export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    // --------------------------------------------------------------------------------- //
    // POST auth/register
    async register(request: FastifyRequest<{ Body: RegisterData }>, reply: FastifyReply) {
        try {
            const validation = AuthSchema.register.safeParse(request.body);
            if (!validation.success)
                return reply.status(400).send({
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input'
                });

            // Checks if the user already exists; if not, creates it; returns sanitized user + tokens
            const result = await this.authService.register(validation.data);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                ...result,
            });
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }

    // --------------------------------------------------------------------------------- //
    // POST auth/login
    async login(request: FastifyRequest<{ Body: LoginData }>, reply: FastifyReply) {
        try {
            const validation = AuthSchema.login.safeParse(request.body);
            if (!validation.success)
                return reply.status(400).send({ 
                    success: false,
                    message: validation.error?.issues?.[0]?.message || 'Invalid input'
                });
            
            const mail = CommonSchema.email.safeParse(validation.data.identifier);
            const username = CommonSchema.username.safeParse(validation.data.identifier);
            // Check if the username or email address is in the correct format
            if (!mail.success && !username.success) {
                throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Bad identifier');
            }

            const identifier = mail.success ? mail.data : username.data;
            if (!identifier)
                throw new AuthException(AuthError.INVALID_CREDENTIALS, 'bad identifiers');

            // Finds the user and generates the tokens, returns the sanitized user + tokens
            const result = await this.authService.login(identifier, validation.data.password);

            return reply.status(200).send({
                success: true,
                message: 'Connection successful',
                ...result,
            });
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });   
        }
    }

    // --------------------------------------------------------------------------------- //
    // GET auth/refresh
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
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }

    // --------------------------------------------------------------------------------- //
    // GET auth/callback
	async callback42(request: FastifyRequest<{ Querystring: VerifData }>, reply: FastifyReply) {
		try {
            const { code } = request.query;

            if (!code || code.length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Authorization code missing',
                });
            }
			const result = await this.authService.loginWith42(code);

			return reply.status(200).send({
				success: true,
				message: result.msg,
				user: result.user,
				tokens:	result.tokens,
			});
		} catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
		}
	}
}
