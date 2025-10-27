import { z } from 'zod'

// --------------------------------------------------------------------------------------------------------- //

export const emailSchema = z.email('invalid email format');

// --------------------------------------------------------------------------------------------------------- //

export const passwordSchema = z.string()
    .min(8, 'Password must contain at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one capital letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
    .regex(/(?=.*[@$!%*?&.#_\-+=()\[\]{}|:;,<>~])/, 'Password must contain at least one special character included in this list : @$!%*?&.#_\-+=()\[\]{}|:;,<>~');

// --------------------------------------------------------------------------------------------------------- //

export const idSchema = z.number()
    .int()
    .min(1)
    .max(2147483647);

// --------------------------------------------------------------------------------------------------------- //

export const idParamSchema = z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(idSchema);

// --------------------------------------------------------------------------------------------------------- //

export const usernameSchema = z.string()
    .min(3, 'usename should have 3 characters minimum')
    .max(20, 'Username can\'t exceed 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers');

// --------------------------------------------------------------------------------------------------------- //

export const usernameSearchSchema = z.string()
    .min(1, 'the parameter must have 1 character minimum')
    .max(20, 'the parameter can\'t exceed 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers');
// --------------------------------------------------------------------------------------------------------- //
