import { type FastifyRequest, type FastifyReply } from "fastify";
import { UsersService} from "../services/UsersService.js";
import { CommonSchema } from "@shared/common.schema";
import { UsersSchema } from "../schemas/users.schema.js";
import { UsersException, UsersError } from "../error_handlers/Users.error.js";
import { ErrorWrapper } from "../error_handlers/ErrorWrapper.js";

export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}
    
    // ----------------------------------------------------------------------------- //
    // GET /users/search/id/:id
    async getById(request: FastifyRequest<{ Params: {id: string} }>, reply: FastifyReply) {
        try {
            const userId = Number((request as any).user.userId);
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
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }

    // ----------------------------------------------------------------------------- //
    // GET /users/search/username/:username
    async getByName(request: FastifyRequest<{ Params: {username: string} }>, reply: FastifyReply) {
        try {
            const userId = Number((request as any).user.userId);
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
        } catch (error) {
            const err = ErrorWrapper.analyse(error);
            console.log(err.message);
            return reply.status(err.code).send({
                success: false,
                message: err.message,
            });
        }
    }
}
