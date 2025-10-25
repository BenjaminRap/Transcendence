import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { generateToken } from './JWTmanagement.js';
import { emailSchema } from '../schemas/commonSchema.js';
import { usernameSchema } from '../schemas/authSchema.js';
import { User, Tokens, RegisterUser, UpdateUser } from '../../data_structure/auth.js';

const SALT_ROUNDS = 12;

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

async function hashPassword(password: string) : Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function isExistingUser(fastify: FastifyInstance, email: string, username: string) : Promise<boolean>
{
    let user = await fastify.prisma.user.findUnique({
        where: {
            email
        }
    });
    if (user)
        return true;

    user = await fastify.prisma.user.findUnique({
        where: {
            username
        }
    });
    if (user)
        return true;
    return false;
}

export async function addUserInDB(data: RegisterUser, fastify: FastifyInstance) :
Promise<{ id: number, avatar: string, tokens: Tokens }>
{
    const hashedPassword = await hashPassword(data.password);
    const userAvatar = data.avatar || 'https://i.pravatar.cc/150?img=7';

    const user = await fastify.prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
            avatar: userAvatar
        }
    });
    const tokens = generateToken(user.id, data.email);

    return {
        id: user.id,
        avatar: userAvatar,
        tokens: {
            token: (await tokens).token,
            refresh_token: (await tokens).refresh_token
        }
    };
}

export async function findUser(fastify: FastifyInstance, identifier: string, password: string) :
Promise<{user: User | undefined, tokens: Tokens, validPass: boolean, message: string}>
{
    let user = undefined;

    if (emailSchema.safeParse(identifier).success) {
        user = await fastify.prisma.user.findUnique({
            where: {
                email: identifier
            }
        });
    }
    else if (usernameSchema.safeParse(identifier).success) {
        user = await fastify.prisma.user.findUnique({
            where: {
                username: identifier
            }
        });
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

    if (!await comparePassword(password, user.password)) {
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

export async function updateUser(fastify: FastifyInstance, user: UpdateUser, email: string) : Promise<{ success: boolean }>
{
    fastify.prisma.user.updateMany({
        where: {
            email
        },
        data: user
    });
    return {
        success: true
    };
}

/*
{
    "username": "flo",
    "password": "aGre4tP@SSWOrdVeryC0mPlic4tED",
    "email": "mail@mail.com"
}


{
    "username": "flo",
    "password": "aGre4tP@SSWOrdVeryC0mPlic4t",
    "email": "mail@mail.com",
    "avatar": "http://avatar.com"
}
*/