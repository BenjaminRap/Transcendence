import { string, z } from 'zod'
import { CommonSchema } from './common.schema.js'

export const SuscriberSchema = {
    update: z.object({
        username: CommonSchema.username.optional(),
        avatar: CommonSchema.avatar.optional()
    }).strict().refine(
        (data) => data.username !== undefined || data.avatar !== undefined,
        {
            message: "At least one of 'username' or 'avatar' must be provided",
            path: ["username"] // ou "avatar", peu importe => juste pour pointer l’erreur
        }
    ),

    updatePassword: z.object({
        tokenKey: string().min(1),
        newPassword: CommonSchema.password,
    }).strict(),
}