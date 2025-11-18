import { string, z } from 'zod'
import { CommonSchema } from './common.schema.js'

export const SuscriberSchema = {
    updateUsername: z.object({ 
          username: CommonSchema.username 
        }).strict(),

    updateAvatar: z.object({
          avatar: CommonSchema.avatar,
        }).strict(),

    updatePassword: z.object({
          tokenKey: CommonSchema.jwt,
          newPassword: CommonSchema.password,
          confirmNewPassword: string().min(1, "You must confirm your new password"),
          confirmChoice: z.boolean()
                          .refine((val) => val === true, {
                              message: "You must confirm this action"
                          })
        }).strict()
          .refine((data) => data.newPassword === data.confirmNewPassword, {
            message: "New password and confirmation do not match",
        }),
}