import { FastifyRequest, FastifyReply } from 'fastify';

export class PreparsingMiddleware {
    constructor() {}

    // --------------------------------------------------------------------------------- //
    checkHeaders = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Example preparsing logic: log request details
            // console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
            
            if (!request.headers['application-json']) {
                return reply.status(400).send({
                    success: false,
                    message: 'Missing required application type header',
                });
            }
        
        } catch (error) {
            return reply.status(500).send({
                success: false,
                message: 'Error during request preparsing',
            });
        }
    };
    
    // --------------------------------------------------------------------------------- //
    checkBody = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!request.body) {
                return reply.status(400).send({
                    success: false,
                    message: 'Request body cannot be empty',
                });
            }
        
        } catch (error) {
            return reply.status(500).send({
                success: false,
                message: 'Error during request preparsing',
            });
        }
    };
}