import { FastifyRequest, FastifyReply } from "fastify";
import { UsersService, UserErrors } from "../services/usersService.js";
import { idParamSchema, usernameSearchSchema } from "../routes/schemas/schemaRules.js";

export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}
    
    // ----------------------------------------------------------------------------- //
    async getById(request: FastifyRequest, reply: FastifyReply) {
        try {
            // have to check auth current user
            // params validation
            const idData = idParamSchema.safeParse(request.params['id']);
            if (!idData.success) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid ID format'
                });
            }
            // fetch user throw exception if not found
            const user = await this.usersService.getById(idData.data);

            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user
            });
        } catch (error) {
            if (error.message === UserErrors.USER_NOT_FOUND) {
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

    // ----------------------------------------------------------------------------- //
    async getByName(request: FastifyRequest, reply: FastifyReply) {
        try {
            // have to check auth current user
            // params validation
            const searchedUser = usernameSearchSchema.safeParse(request.params['username']);
            if (!searchedUser.success) {
                return reply.status(400).send({
                    success: false,
                    message: searchedUser.error.issues[0].message
                });
            }
            // fetch user list throw exception if not found
            const user = await this.usersService.getByName(searchedUser.data);

            return reply.status(200).send({
                success: true,
                message: 'Profiles successfully retrieved',
                user
            });
        } catch (error) {
            if (error.message === UserErrors.USER_NOT_FOUND) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });                
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            })
        }
    }
}
