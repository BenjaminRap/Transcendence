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
            path: ["username or avatar or both"]
        }
    ),

    updatePassword: z.object({
        tokenKey: string().min(1),
        newPassword: CommonSchema.password,
        confirmNewPassword: string().min(1, "You must confirm your new password"),
        confirmChoice: z.boolean().refine((val) => val === true, {
            message: "You must confirm this action"
        })
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "New password and confirmation do not match",
    }).strict(),
}