import type { FastifyRequest, FastifyReply } from 'fastify';

export class HeaderMiddleware {
    // --------------------------------------------------------------------------------- //
    logHeaders = async (request: FastifyRequest, reply: FastifyReply) => {
        console.log('Request Headers:', request.headers);
    };

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
}
