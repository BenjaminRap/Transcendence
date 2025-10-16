import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { user } from './API/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'complEcatEd-kEy';
const SALT_ROUNDS = 12;

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

export function verifyToken(token: string): { userId: number; email: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    } catch (error) {
        return null;
    }
}

function generateToken(userId: number, email: string): string
{
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// data register validation ---------------------------------------------------------------------------------------------------------------------- //

function validateEmail(email: string) : boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password: string) : { isValid: boolean; message: string } {

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
            message: 'All fields are required'
        };
    }

    if (username.length > 20)
    {
        return {
            success: false,
            message: 'Username can\'t exceed 20 characters'
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

export async function isExistingUser(fastify: FastifyInstance, email: string) :
Promise<boolean>
{
    const user = await fastify.db.get<user>(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    if (user)
        return true;

    // verifier si le username existe deja dans le db

    return false;
}

// add user in the DB ---------------------------------------------------------------------------------------------------------------------------- //

async function hashPassword(password: string) :
Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function addUserInDB(username: string, email: string, password: string, avatar: string, fastify: FastifyInstance) :
Promise<{ id: number, avatar: string, token: string }>
{
    const hashedPassword = await hashPassword(password);

    // default avatar if not provided
    const userAvatar = avatar || 'https://i.pravatar.cc/150?img=7';

    // insert the new user into the database
    const result = await fastify.db.run(
        'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, userAvatar]
    );

    // generate a jwt token
    // attention, la gestion du token n'est pas encore faite
    const token = generateToken(result.lastID as number, email);

    return {
        id: result.lastID,
        avatar: userAvatar,
        token: token
    };
}


// retrieve user in the DB ----------------------------------------------------------------------------------------------------------------------- //

export async function findUser(fastify: FastifyInstance, identifier: string, password: string) :
Promise<{user: user | undefined, accesstoken: string, validPass: boolean, message: string}>
{
    let user = undefined;

    if (validateEmail(identifier)) {
        console.log("MAIL VALUE: ", identifier);

        user = await fastify.db.get<user>(
            'SELECT * FROM users WHERE email = ?',
            identifier
        );
    }
    else {
        console.log("USERNAME VALUE: ", identifier);
        user = await fastify.db.get<user>(
            'SELECT * FROM users WHERE username = ?',
            identifier
        );
    }        

    if (!user) {
        console.log("IN INCORRECT IDENTIFIER");
        return {
            user: user,
            accesstoken: '',
            validPass: false,
            message: 'Incorrect email / identifier or password'
        };        
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {

        console.log("IN INCORRECT PASSWORD");
        
        return {
            user: user,
            accesstoken: '',
            validPass: false,
            message: 'Incorrect email / identifier or password'
        };
    }

    const accesstoken = generateToken(user.lastID, user.email);
    if (!accesstoken){

        console.log("IN INCORRECT TOKEN");

        return {
            user: user,
            accesstoken: accesstoken,
            validPass: true,
            message: 'Error generating token'
        };
    }
    return { 
        user,
        accesstoken,
        validPass: true,
        message: ''
    };
}
