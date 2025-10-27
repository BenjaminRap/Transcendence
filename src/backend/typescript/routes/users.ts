import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkAuth } from './utils/JWTmanagement.js'
import { getUserById, getManyUsersByName } from './DBRequests/users.js'
import { idParamSchema, usernameSearchSchema } from './schemas/schemaRules.js';
import { PublicProfileResponse, sanitizePublicProfile, searchedUserResponse } from './dataStructure/usersStruct.js'

export async function usersRoutes(fastify: FastifyInstance) {
    // /users/:id
    fastify.get('/:id', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const idData = idParamSchema.safeParse(request.params['id']);
            if (!idData.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'invalid ID'
                } as PublicProfileResponse);
            }

            const user = await getUserById(fastify, idData.data);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                } as PublicProfileResponse);
            }
            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user: sanitizePublicProfile(user)
            } as PublicProfileResponse)
            
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            } as PublicProfileResponse);
        }
    });

    // /users/search/:username
    fastify.get('/search/:username', { preHandler: checkAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const searchedUser = usernameSearchSchema.safeParse(request.params['username']);
            if (!searchedUser.success) {
                return reply.status(400).send({
                    success: false,
                    message: searchedUser.error.issues[0].message
                } as searchedUserResponse);
            }

            const usersFound = await getManyUsersByName(fastify, searchedUser.data);
            if (!usersFound) {
                return reply.status(404).send({
                    success: false,
                    message: 'no profile found'
                } as searchedUserResponse);
            }

            return reply.status(200).send({
                success: true,
                message: 'many user were found',
                usersFound
            } as searchedUserResponse);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'internal server error'
            } as searchedUserResponse);
        }
    });
}
