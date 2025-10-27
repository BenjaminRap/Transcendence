import { FastifyRequest, FastifyReply} from 'fastify';
import jwt from 'jsonwebtoken';
import { Tokens } from '../dataStructure/authStruct.js'

const JWT_SECRET = process.env.JWT_SECRET || 'complEcatEd-kEy';

export function verifyToken(token: string): { userId: number, email: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number, email: string };
    } catch (error) {
        return null;
    }
}

export async function generateToken(userId: number, email: string): Promise<Tokens>
{
    const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    const refresh_token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '2h'}
    );

    return {
        token: token,
        refresh_token: refresh_token
    };
}

export async function checkAuth(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(400).send({
            success: false,
            message: 'Missing authentication token'
        });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
        return reply.status(401)
            .header('WWW-Authenticate', 'Bearer')        
            .send({
                success: false,
                message: 'Invalid token'
            });
    }

    (request as any).user = decoded;
}
