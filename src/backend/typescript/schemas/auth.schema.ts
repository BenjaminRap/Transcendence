import { z } from 'zod'
import { CommonSchema } from './common.schema.js'

export const AuthSchema = {
    
    register: z.object({
        username: CommonSchema.username,
        password: CommonSchema.password,
        email: CommonSchema.email,
        avatar: CommonSchema.avatar.optional(),
    }).strict(),

    login: z.object({
        identifier: z.string()
                    .trim()
                    .min(1, 'Email or username is required'),
        password: CommonSchema.password
    }).strict(),

    verifyPassword: z.object({
        password: CommonSchema.password
    }).strict(),

}
