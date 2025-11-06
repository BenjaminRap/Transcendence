import { z } from 'zod'
import { CommonSchema } from './common.schema'

export const UsersSchema = {
    fetchedName: z.string()
                .min(1, 'the parameter must have 1 character minimum')
                .max(20, 'the parameter can\'t exceed 20 characters')
                .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
}
