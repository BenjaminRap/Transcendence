import { z } from 'zod'

export const CommonSchema = {
    email: z.email('invalid email format')
            .trim(),

    password: z.string()
            .min(8, 'Password must contain at least 8 characters')
            .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase')
            .regex(/(?=.*[a-z])/, 'Password must contain at least one capital letter')
            .regex(/(?=.*\d)/, 'Password must contain at least one number')
            .regex(/(?=.*[@$!%*?&.#_\-+=()\[\]{}|:;,<>~])/, 'Password must contain at least one special character included in this list : @$!%*?&.#_\-+=()\[\]{}|:;,<>~')
            .trim(),

    username: z.string()
            .min(3, 'usename should have 3 characters minimum')
            .max(20, 'Username can\'t exceed 20 characters')
            .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
            .trim(),

	id: z.number()
		.int()
		.min(1)
		.max(2147483647),

	idParam: z.string()
			.regex(/^\d+$/)
			.transform(Number)
			.pipe(z.number().int().min(1).max(2147483647)),
	
	avatar: z.string()
}