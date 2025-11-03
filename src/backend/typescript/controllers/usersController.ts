import { FastifyRequest, FastifyReply } from "fastify";
import { UsersService } from "../services/usersService.js";
import { idParamSchema, usernameSearchSchema } from "../routes/schemas/schemaRules.js";

export class UsersController {
    constructor(private usersService: UsersService) {}

    async getUserById(request: FastifyRequest, reply: FastifyReply) {
        try {
            // have to check auth current user

            const idData = idParamSchema.safeParse(request.params['id']);
            if (!idData.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid ID format'
                });
            }

            const user = await this.usersService.getUserById(idData.data);

            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                ... user
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });                
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getUserByName(request: FastifyRequest, reply: FastifyReply) {
        try {
            // have to check auth current user

            const searchedUser = usernameSearchSchema.safeParse(request.params['username']);
            if (!searchedUser.success) {
                return reply.status(400).send({
                    success: false,
                    message: searchedUser.error.issues[0].message
                });
            }

            const user = await this.usersService.getUserByName(searchedUser.data);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                ... user
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            })
        }
    }
}
