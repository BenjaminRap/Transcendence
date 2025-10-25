import { z } from 'zod'

export const emailSchema = z.email('invalid email format');

export const passwordSchema = z.string()
    .min(8, 'Password must contain at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one capital letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
    .regex(/(?=.*[@$!%*?&.#_\-+=()\[\]{}|:;,<>~])/, 'Password must contain at least one special character included in this list : @$!%*?&.#_\-+=()\[\]{}|:;,<>~');

