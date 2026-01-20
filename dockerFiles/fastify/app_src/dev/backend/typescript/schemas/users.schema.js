import { z } from 'zod';
export const UsersSchema = {
    fetchedName: z.string()
        .trim()
        .min(1, 'Request in at least one character')
        .max(20, 'Username can\'t exceed 20 characters')
        .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
};
