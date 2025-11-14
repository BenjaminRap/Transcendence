import { string, z } from 'zod'
import { CommonSchema } from './common.schema.js'

export const SuscriberSchema = {
    update: z.object({
        tokenKey: string().min(1),
        username: CommonSchema.username.optional(),
        avatar: CommonSchema.avatar.optional()
    }).strict(),

    updatePassword: z.object({
        tokenKey: string().min(1),
        newPassword: CommonSchema.password,
    }).strict(),
}