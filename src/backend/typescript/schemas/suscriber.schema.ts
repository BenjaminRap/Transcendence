import { string, z } from 'zod'
import { CommonSchema } from './common.schema.js'

export const SuscriberSchema = {
    updateUsername: z.object({
            username: CommonSchema.username
        }).strict(),

    updatePassword: z.object({
          currentPassword: CommonSchema.password,
          newPassword: CommonSchema.password,
          confirmNewPassword: string().min(1, "You must confirm your new password"),
        }).strict()
          .refine((data) => data.newPassword === data.confirmNewPassword, {
            message: "New password and confirmation do not match",
        }),
}