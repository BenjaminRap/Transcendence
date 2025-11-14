import { z } from 'zod'
import { CommonSchema } from './common.schema.js'

export const SuscriberSchema = {
    update: z.object({
        username: CommonSchema.username.optional(),
        password: CommonSchema.password.optional(),
        avatar: CommonSchema.avatar.optional()
    }).strict(),
}