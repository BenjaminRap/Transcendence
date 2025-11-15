import { FastifyRequest, FastifyReply } from 'fastify';
import { TokenManager } from '../utils/TokenManager.js';
import { DeleteAccount, UpdatePassword } from '../types/suscriber.types.js';

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

    // --------------------------------------------------------------------------------- //
    keyAuthenticate = async (request: FastifyRequest<{ Body: UpdatePassword | DeleteAccount }>, reply: FastifyReply) => {
        try {
            const token = request.body?.tokenKey;
            const decoded = await this.tokenManager.verify(token, false);

            if (decoded.userId !== (request as any).user.userId) {
                return reply.status(403).send({
                    success: false,
                    message: 'tokenKey user mismatch',
                });
            }

            // Bind user with the request
            (request as any).verifiedUser = decoded;
        } catch (error) {
            return reply.status(403).send({
                success: false,
                message: 'Invalid or expired tokenKey',
            });
        }
    };

}
