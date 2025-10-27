import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { generateToken } from './JWTmanagement.js';
import { emailSchema } from '../schemas/commonSchema.js';
import { usernameSchema } from '../schemas/authSchema.js';
import { getUserByEmail, getUserByName, createUserInDb, updateUserById } from '../DBRequests/users.js';
import { User, Tokens, RegisterUser, UpdateUser } from '../dataStructure/auth.js';

const SALT_ROUNDS = 12;

async function hashPassword(password: string) : Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

export async function isExistingUser(fastify: FastifyInstance, email: string, username: string) : Promise<{alreadyExist: boolean, message: string}>
{
    if (await getUserByEmail(fastify, email)) {
        return {
            alreadyExist: true,
            message: 'A user with this email already exists'
        };
    }
    if (await getUserByName(fastify, username)) {
        return {
            alreadyExist: true,
            message: 'A user with this username already exists'
        };
    }
    return {
        alreadyExist: false,
        message: ''
    }
}

export async function createUser(data: RegisterUser, fastify: FastifyInstance) : Promise<{ user: User, tokens: Tokens }>
{
    data.password = await hashPassword(data.password);

    if (data.avatar)
        data.avatar = data.avatar;

    const user = await createUserInDb(fastify, data);
    const tokens = await generateToken(user.id, user.email);

    return {
        user,
        tokens
    };
}

export async function getExistingUser(fastify: FastifyInstance, identifier: string, password: string) :
Promise<{user: User | undefined, tokens: Tokens, message: string}>
{
    let user = undefined;

    if (emailSchema.safeParse(identifier).success)
        user = await getUserByEmail(fastify, identifier);
    else if (usernameSchema.safeParse(identifier).success)
        user = await getUserByName(fastify, identifier);

    if (!user || !await comparePassword(password, user.password)) {
        return {
            user: user,
            tokens: {
                token: '',
                refresh_token: ''
            },
            message: 'Incorrect email/identifier or password'
        };
    }
    
    const tokens = await generateToken(user.id , user.email);
    return { 
        user,
        tokens,
        message: ''
    };
}

export async function hasNoDifference(newData: UpdateUser, user: User) : Promise<boolean>
{
    if ((newData.avatar && newData.avatar === user.avatar) ||
        (newData.password && await comparePassword(newData.password, user.password)) ||
        (newData.username && newData.username === user.username)) {
        return true;
    }
    return false
}

export async function updateUser(fastify: FastifyInstance, newData: UpdateUser, user: User) : Promise<{user: User | undefined, message: string}>
{
    if (await hasNoDifference(newData, user)) {
        return { 
            user: undefined,
            message: 'No changes detected: your new data must differ from your current information.'
        };
    }

    if (newData.username && await getUserByName(fastify, newData.username)) {
        return {
            user: undefined,
            message: 'this identifier is unavailable'
        };
    }

    if (newData.password)
        newData.password = await hashPassword(newData.password);

    return {
        user: await updateUserById(fastify, newData, user.id),
        message: ''
    };
}
