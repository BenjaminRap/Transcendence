import { z } from 'zod'
import { emailSchema, passwordSchema } from './commonSchema.js';

export const usernameSchema = z.string()
    .min(3, 'usename should have 3 characters minimum')
    .max(20, 'Username can\'t exceed 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers');

export const userSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
    email: emailSchema
}).strict();

export const updateSchema = z.object({
    username: usernameSchema.optional(),
    password: passwordSchema.optional(),
    avatar: z.string().optional()
}).strict();
