import { FastifyInstance } from 'fastify';
import { User, RegisterUser, UpdateUser } from '../dataStructure/auth.js'

export async function getUserByEmail(fastify: FastifyInstance, email: string) : Promise<User | undefined> {
    return await fastify.prisma.user.findUnique({
        where: { email }
    });
}

export async function getUserByName(fastify: FastifyInstance, username: string) : Promise<User | undefined> {
    return await fastify.prisma.user.findUnique({
        where: { username }
    });
}

export async function getUserById(fastify: FastifyInstance, id: number) : Promise<User | undefined> {
    return await fastify.prisma.user.findUnique({
        where: { id }
    });
}

export async function createUserInDb(fastify: FastifyInstance, data: RegisterUser) : Promise<User>
{
    return await fastify.prisma.user.create({
        data
    });
}

export async function updateUserById(fastify: FastifyInstance, data: UpdateUser, id: number) : Promise<User>
{
    return await fastify.prisma.user.updateMany({
        where: { id },
        data
    });
}

export async function getAllDb(fastify: FastifyInstance){
     return await fastify.prisma.user.findMany();
}