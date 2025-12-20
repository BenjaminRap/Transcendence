import { FastifyRequest, FastifyReply } from 'fastify';

export class HeaderMiddleware {
    private expectedGameSecret = process.env.GAME_BACKEND_SECRET || '';

    // --------------------------------------------------------------------------------- //
    checkFormData = async (request: FastifyRequest, reply: FastifyReply) => {
        const contentType = request.headers['content-type'] || '';
        console.log('Content-Type:', contentType);
        if (!contentType.includes('multipart/form-data')) {
            return reply.status(400).send({
                success: false,
                message: 'Content-Type must be multipart/form-data',
            });
        }
    };

    // --------------------------------------------------------------------------------- //
    checkGameSecret = async (request: FastifyRequest, reply: FastifyReply) => {
        const gameSecret = request.headers['x-game-secret'];
        if (gameSecret !== this.expectedGameSecret) {
            return reply.code(403).send({
                success: false,
                message: 'Forbidden'
            });
        }
    }
}