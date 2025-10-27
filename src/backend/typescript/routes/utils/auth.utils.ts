import { FastifyInstance } from 'fastify';
import { generateToken } from './JWTmanagement.js';
import { emailSchema, usernameSchema } from '../schemas/schemaRules.js';
import { RegisterData, authUser, Tokens } from '../dataStructure/authStruct.js';
import { createUserInDb, getUserByEmail, getUserByName } from '../DBRequests/users.js';
import { comparePassword, hashPassword } from './utils.js'

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

export async function createUser(data: RegisterData, fastify: FastifyInstance) : Promise<{ user: authUser, tokens: Tokens }>
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
Promise<{user: authUser | undefined, tokens: Tokens | undefined}>
{
    let user = undefined;

    if (emailSchema.safeParse(identifier).success)
        user = await getUserByEmail(fastify, identifier);
    else if (usernameSchema.safeParse(identifier).success)
        user = await getUserByName(fastify, identifier);

    if (!user || !await comparePassword(password, user.password)) {
        return {
            user: user,
            tokens: undefined
        };
    }
    
    const tokens = await generateToken(user.id , user.email);

    return { 
        user,
        tokens
    };
}
