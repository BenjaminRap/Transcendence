import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { User } from '../dataStructure/commonStruct.js';
import { UpdateData } from '../dataStructure/usersStruct.js';
import { getUserByName, updateUserById } from '../DBRequests/users.js';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string) : Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

export async function hasNoDifference(newData: UpdateData, user: User) : Promise<boolean>
{
    if ((newData.avatar && newData.avatar === user.avatar) ||
        (newData.password && await comparePassword(newData.password, user.password)) ||
        (newData.username && newData.username === user.username)) {
        return true;
    }
    return false
}

export async function updateUser(fastify: FastifyInstance, newData: UpdateData, user: User) : Promise<{user: User | undefined, message: string}>
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
