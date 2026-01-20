import { TokenManager } from '../utils/TokenManager.js';
export class AuthMiddleware {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        // --------------------------------------------------------------------------------- //
        this.authenticate = async (request, reply) => {
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
                request.user = decoded;
            }
            catch (error) {
                return reply.status(401).send({
                    success: false,
                    message: 'Invalid or expired token',
                });
            }
        };
        // --------------------------------------------------------------------------------- //
        this.refreshAuthenticate = async (request, reply) => {
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
                request.user = decoded;
            }
            catch (error) {
                return reply.status(401).send({
                    success: false,
                    message: 'Invalid or expired token',
                });
            }
        };
        // --------------------------------------------------------------------------------- //
        this.keyAuthenticate = async (request, reply) => {
            try {
                const token = request.body?.tokenKey;
                const decoded = await this.tokenManager.verify(token, false);
                if (decoded.userId !== request.user.userId) {
                    return reply.status(403).send({
                        success: false,
                        message: 'tokenKey user mismatch',
                    });
                }
                // Bind user with the request
                request.verifiedUser = decoded;
            }
            catch (error) {
                return reply.status(403).send({
                    success: false,
                    message: 'Invalid or expired tokenKey',
                });
            }
        };
    }
}
