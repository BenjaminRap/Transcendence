import { z } from 'zod'
import { usernameSchema, passwordSchema, emailSchema } from './schemaRules.js'

// --------------------------------------------------------------------------- //

export const registerUserSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
    email: emailSchema
}).strict();

// --------------------------------------------------------------------------- //

export const updateSchema = z.object({
    username: usernameSchema.optional(),
    password: passwordSchema.optional(),
    avatar: z.string().optional()
}).strict();

// --------------------------------------------------------------------------- //
