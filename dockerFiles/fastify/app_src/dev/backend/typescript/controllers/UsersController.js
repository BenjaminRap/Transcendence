import {} from "fastify";
import { UsersService } from "../services/UsersService.js";
import { CommonSchema } from "../schemas/common.schema.js";
import { UsersSchema } from "../schemas/users.schema.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";
export class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    // ----------------------------------------------------------------------------- //
    // GET /users/search/id/:id
    async getById(request, reply) {
        try {
            const userId = Number(request.user.userId);
            // params validation
            const idData = CommonSchema.idParam.safeParse(request.params['id']);
            if (!idData.success) {
                return reply.status(400).send({
                    success: false,
                    message: idData.error?.issues?.[0]?.message || 'Invalid input'
                });
            }
            // fetch user throw exception if not found
            const user = await this.usersService.getById(idData.data, userId);
            return reply.status(200).send({
                success: true,
                message: 'Profile retrieved successfully',
                user
            });
        }
        catch (error) {
            if (error instanceof UsersException) {
                switch (error.code) {
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
    // GET /users/search/username/:username
    async getByName(request, reply) {
        try {
            const userId = Number(request.user.userId);
            // params validation
            const searchedUser = UsersSchema.fetchedName.safeParse(request.params['username']);
            if (!searchedUser.success) {
                throw new UsersException(UsersError.INVALID_NAME, UsersError.INVALID_NAME);
            }
            // fetch user list or empty list if nothing match
            const users = await this.usersService.getByName(searchedUser.data, userId);
            return reply.status(200).send({
                success: true,
                message: 'Profiles successfully retrieved',
                user: users
            });
        }
        catch (error) {
            if (error instanceof UsersException) {
                switch (error.code) {
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
}
