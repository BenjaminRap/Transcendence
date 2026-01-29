import type { FastifyRequest, FastifyReply } from 'fastify';
import { TokenManager } from '../utils/TokenManager.js';

export class AuthMiddleware {
    constructor(private tokenManager: TokenManager) {}

    // --------------------------------------------------------------------------------- //
    authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authHeader = request.headers?.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return reply.status(401).send({
                    success: false,
                    message: 'Missing or invalid authorization header',
                });
            }

            const token = authHeader.substring(7);
            const decoded = await this.tokenManager.verify(token, false);

            // Bind user payload (id and mail) with the request
            (request as any).user = decoded;
        } catch (error) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid or expired token',
            });
        }
    };

    // --------------------------------------------------------------------------------- //
    refreshAuthenticate = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authHeader = request.headers?.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return reply.status(401).send({
                    success: false,
                    message: 'Missing or invalid authorization header',
                });
            }

            const token = authHeader.substring(7);
            const decoded = await this.tokenManager.verify(token, true);

            // Bind user with the request
            (request as any).user = decoded;
        } catch (error) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid or expired token',
            });
        }
    };

}
