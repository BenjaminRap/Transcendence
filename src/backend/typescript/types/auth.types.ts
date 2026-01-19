import type { User } from '@prisma/client';

export interface RegisterData
{
    username:   string,
    email:      string,
    password:   string,
}

export interface LoginData
{
    identifier: string,
    password:   string
}

export interface VerifData
{
    code:       string
}

export function sanitizeUser(user: User): SanitizedUser {
    return {
        id: String(user.id),
        username: user.username,
        avatar: user.avatar
    } as SanitizedUser;
}
