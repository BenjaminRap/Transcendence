import { z } from 'zod'

export const CommonSchema = {
    email: z.email({ message: 'invalid email format' }),

    password: z.string()
            .trim()
            .min(8, 'Password must contain at least 8 characters')
            .max(64, 'Password can\'t exceed 64 characters')
            .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase')
            .regex(/(?=.*[A-Z])/, 'Password must contain at least one capital letter')
            .regex(/(?=.*\d)/, 'Password must contain at least one number')
            .regex(/(?=.*[@$!%*?&.#_\-+=()\[\]{}|:;,<>~])/, 'Password must contain at least one special character included in this list : @$!%*?&.#_\-+=()\[\]{}|:;,<>~')
            .trim(),

    shownName: z.string()
            .trim()
            .min(3, 'ShownName should have 3 characters minimum')
            .max(20, 'ShownName can\'t exceed 20 characters')
            .regex(/^(?:@|guest)?[a-zA-Z0-9]*$/, 'ShownName can start by `@` or `guest` or nothing, then characters can only be letters and numbers'),

    username: z.string()
            .trim()
            .min(3, 'Username should have 3 characters minimum')
            .max(20, 'Username can\'t exceed 20 characters')
            .regex(/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/, 'Username can only contain letters, numbers, and `-` or `_`')
            .refine((val) => !['@', 'guest'].some(prefix => val.startsWith(prefix)), {
                message: 'This username is not allowed, don\'t use reserved prefixes (A_ , G_)',
            }),

    alias: z.string()
            .trim()
            .min(3, 'Alias should have 3 characters minimum')
            .max(20, 'Alias can\'t exceed 20 characters')
            .regex(/^@[a-zA-Z0-9]+$/, 'Alias should begin by `@` and only contain letters and numbers'),

    guestName: z.string()
            .trim()
            .min(3, 'Alias should have 3 characters minimum')
            .max(20, 'Alias can\'t exceed 20 characters')
            .regex(/^guest[a-zA-Z0-9]+$/, 'Alias should begin by `guest` and only contain letters and numbers'),

    id: z.number()
	    	.int()
	    	.min(1)
	    	.max(2147483647),

    Ids: z.array(z.number('must be a number')
                .int()
                .min(1, 'must be in the right range')
                .max(2147483647, 'must be in the right range')
        	),

    idParam: z.string()
			.trim()
	    	.regex(/^\d+$/)
	    	.transform(Number)
	    	.pipe(z.number().int().min(1).max(2147483647)),
	
    avatar: z.string()
            .trim(),

	jwt: z.jwt({ alg: "HS256", message: "Invalid jwt format" }),

}
