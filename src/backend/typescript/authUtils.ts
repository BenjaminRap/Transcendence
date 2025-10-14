import { FastifyInstance } from 'fastify';
import { bcrypt } from 'bcryptjs';
import { jwt } from 'jsonwebtoken';
import { authResponse, user } from './API/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'complEcatEd-kEy';
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number, email: string): string
{
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyToken(token: string): { userId: number; email: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
        return decoded;
    } catch (error) {
        return null;
    }
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password: string): { isValid: boolean; message: string } {

    const failedResponse = 'Password must contain at least:\n8 characters\none lowercase letter\none capital letter\none number';
    
    if (password.length < 8) {
        return { isValid: false, message: failedResponse };
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, message: failedResponse };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return { isValid: false, message: failedResponse };
    }
    if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, message: failedResponse };
    }
    
    return { isValid: true, message: '' };
}

export function validateRegisterData( username: string, email: string, password: string ) : { success: boolean; message: string}
{
    if (!username || !email || !password)
    {
        return {
            success: false,
            message: 'all fields are required'
        };
    }

    if (!validateEmail(email)) {
        return {
            success: false,
            message: 'Invalid email format'
        };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid)
    {
        return {
            success: false,
            message: passwordValidation.message
        };
    }

    return {
        success: true,
        message: ''
    };
}

export async function existingUser(fastify: FastifyInstance, email: string) : Promise<boolean>
{
    const user = await fastify.db.get<user>(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    if (user)
        return true;
    return false;
}