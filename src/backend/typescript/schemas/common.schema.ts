import { z } from 'zod'
import { id } from 'zod/v4/locales'

export const CommonSchema = {
    email: z.string() // Il manquait z.string() !
            .trim()
            .email('invalid email format'),

    password: z.string()
            .trim()
            .min(8, 'Password must contain at least 8 characters')
            .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase')
            .regex(/(?=.*[A-Z])/, 'Password must contain at least one capital letter') // Corrigé : [A-Z] au lieu de [a-z]
            .regex(/(?=.*\d)/, 'Password must contain at least one number')
            .regex(/(?=.*[@$!%*?&.#_\-+=()\[\]{}|:;,<>~])/, 'Password must contain at least one special character included in this list : @$!%*?&.#_\-+=()\[\]{}|:;,<>~')
            .trim(),

    username: z.string()
            .trim()
            .min(3, 'username should have 3 characters minimum') // Corrigé : typo "usename"
            .max(20, 'Username can\'t exceed 20 characters')
            .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
            .trim(),

    id: z.number()
	    .int()
	    .min(1)
	    .max(2147483647),

    Ids: z.array(z.number().int().min(1).max(2147483647)).min(1), // Corrigé

    idParam: z.string()
            .trim()
	    .regex(/^\d+$/)
	    .transform(Number)
	    .pipe(z.number().int().min(1).max(2147483647)),
	
    avatar: z.string()
            .trim()
}