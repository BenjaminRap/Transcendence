import { User } from '@prisma/client'

export interface RegisterData
{
    username:   string,
    email:      string,
    password:   string,
    avatar?:    string
}

export interface LoginData
{
    identifier: string,
    password:   string
}

export interface SanitizedUser
{
    id:         number,
    username:   string,
    avatar:     string
}

export interface VerifData
{
    password:   string
}

export function sanitizeUser(user: User): SanitizedUser {
    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar
    } as SanitizedUser;
}
