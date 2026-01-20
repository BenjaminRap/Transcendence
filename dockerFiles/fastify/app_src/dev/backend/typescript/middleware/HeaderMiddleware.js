export class HeaderMiddleware {
    constructor() {
        this.expectedGameSecret = process.env.GAME_BACKEND_SECRET || 'game-secret';
        // --------------------------------------------------------------------------------- //
        this.checkFormData = async (request, reply) => {
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
        this.checkGameSecret = async (request, reply) => {
            const gameSecret = request.headers['x-game-secret'];
            if (gameSecret !== this.expectedGameSecret) {
                return reply.code(403).send({
                    success: false,
                    message: 'Forbidden'
                });
            }
        };
    }
}
