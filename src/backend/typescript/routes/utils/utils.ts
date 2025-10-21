import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { User, Tokens } from '../../data_structure/auth.js';
import { generateToken } from './JWTmanagement.js';
import { validateEmail } from './authTokenValidation.js'

const SALT_ROUNDS = 12;

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

async function hashPassword(password: string) :
Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// data register validation ---------------------------------------------------------------------------------------------------------------------- //

export async function isExistingUser(fastify: FastifyInstance, email: string, username: string) :
Promise<boolean>
{
    let user = await fastify.db.get<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    if (user)
        return true;
    
    user = await fastify.db.get<User>(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    if (user)
        return true;

    return false;
}

// add user in the DB ---------------------------------------------------------------------------------------------------------------------------- //


export async function addUserInDB(username: string, email: string, password: string, avatar: string, fastify: FastifyInstance) :
Promise<{ id?: number, avatar: string, tokens: Tokens }>
{
    const hashedPassword = await hashPassword(password);

    // default avatar if not provided
    const userAvatar = avatar || 'https://i.pravatar.cc/150?img=7';

    // insert the new user into the database
    const result = await fastify.db.run(
        'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, userAvatar]
    );

    // generate a jwt token and a refresh token
    const tokens = generateToken(result.lastID as number, email);

    return {
        id: result.lastID,
        avatar: userAvatar,
        tokens: {
            token: (await tokens).token,
            refresh_token: (await tokens).refresh_token
        }
    };
}

// retrieve user in the DB ----------------------------------------------------------------------------------------------------------------------- //

export async function findUser(fastify: FastifyInstance, identifier: string, password: string) :
Promise<{user: User | undefined, tokens: Tokens, validPass: boolean, message: string}>
{
    let user = undefined;

    if (validateEmail(identifier)) {
        user = await fastify.db.get<User>(
            'SELECT * FROM users WHERE email = ?',
            identifier
        );
    }
    else {
        user = await fastify.db.get<User>(
            'SELECT * FROM users WHERE username = ?',
            identifier
        );
    }        
    
    if (!user) {
        return {
            user: user,
            tokens: {
                token: '',
                refresh_token: ''
            },
            validPass: false,
            message: 'Incorrect email / identifier or password'
        };        
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        return {
            user: user,
            validPass: false,
            tokens: {
                token: '',
                refresh_token: ''
            },
            message: 'Incorrect email / identifier or password'
        };
    }

    const accesstoken = generateToken(user.id , user.email);
    return { 
        user,
        tokens: {
            token: (await accesstoken).token,
            refresh_token: (await accesstoken).refresh_token

        },
        validPass: true,
        message: ''
    };
}
