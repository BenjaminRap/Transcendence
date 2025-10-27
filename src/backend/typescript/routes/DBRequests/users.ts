import { FastifyInstance } from 'fastify';
import { User } from '../dataStructure/commonStruct.js'
import { UpdateData } from '../dataStructure/usersStruct.js'
import { RegisterData } from '../dataStructure/authStruct.js'

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

export async function createUserInDb(fastify: FastifyInstance, data: RegisterData) : Promise<User>
{
    return await fastify.prisma.user.create({
        data
    });
}

export async function updateUserById(fastify: FastifyInstance, data: UpdateData, id: number) : Promise<User>
{
    return await fastify.prisma.user.updateMany({
        where: { id },
        data
    });
}

export async function getManyUsersByName(fastify: FastifyInstance, userSearched: string) {
    return await fastify.prisma.user.findMany({
        where: {
            username: { contains: userSearched }
        },
        select: {
            username: true,
            id: true,
        },
        orderBy: { username: 'asc' },
        take: 10
    });
}
