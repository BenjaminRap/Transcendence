import type { FastifyRequest, FastifyReply } from 'fastify';

export class HeaderMiddleware {
    private expectedGameSecret = process.env.GAME_BACKEND_SECRET || 'game-secret';

    // --------------------------------------------------------------------------------- //
    checkFormData = async (request: FastifyRequest, reply: FastifyReply) => {
        const contentType = request.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
            return reply.status(400).send({
                success: false,
                message: 'Content-Type must be multipart/form-data',
            });
        }
    };
}
