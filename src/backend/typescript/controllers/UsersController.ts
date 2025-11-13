import { FastifyRequest, FastifyReply } from "fastify";
import { UsersService} from "../services/UsersService.js";
import { CommonSchema } from "../schemas/common.schema.js";
import { UsersSchema } from "../schemas/users.schema.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";

export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}
    
    // ----------------------------------------------------------------------------- //
    // /users/search/id/:id
    async getById(request: FastifyRequest, reply: FastifyReply) {
        try {
            // params validation
            const idData = CommonSchema.idParam.safeParse(request.params['id']);
            if (!idData.success) {
                throw new UsersException(UsersError.INVALID_ID, UsersError.INVALID_ID);
            }
            // fetch user throw exception if not found
            const user = await this.usersService.getById(idData.data);

            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user
            });
        } catch (error) {
            if (error instanceof UsersException) {
                switch(error.code) {
                    case UsersError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // /users/search/username/:username
    async getByName(request: FastifyRequest, reply: FastifyReply) {
        try {
            // params validation
            const searchedUser = UsersSchema.fetchedName.safeParse(request.params['username']);
            if (!searchedUser.success) {
                throw new UsersException(UsersError.INVALID_NAME, UsersError.INVALID_NAME);
            }

            // fetch user list or empty list if nothing match
            const user = await this.usersService.getByName(searchedUser.data);

            return reply.status(200).send({
                success: true,
                message: 'Profiles successfully retrieved',
                user
            });
        } catch (error) {
            if (error instanceof UsersException) {
                switch(error.code) {
                    case UsersError.USER_NOT_FOUND:
                        return reply.status(404).send({ success: false, message: error.message });
                    default:
                        return reply.status(400).send({ success: false, message: error.message });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error'
            })
        }
    }
}
