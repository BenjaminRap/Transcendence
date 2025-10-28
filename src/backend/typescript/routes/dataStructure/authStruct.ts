
// ----------------------------------------------- //

export interface Tokens
{
    token:          string,
    refresh_token:  string
}

// ----------------------------------------------- //

export interface authUser
{
    id:         number,
    username:   string,
    email:      string,
    avatar:     string
}

// ----------------------------------------------- //

export interface RegisterData
{
    username:   string,
    email:      string,
    password:   string,
    avatar?:     string
}

// ----------------------------------------------- //

export interface LoginData
{
    identifier: string,
    password:   string
}

// ----------------------------------------------- //

export interface AuthResponse
{
    success:    boolean,
    message:    string,
    user?:      authUser,
    tokens?:    Tokens
}

// ----------------------------------------------- //

export function sanitizeUser(user: any) : authUser {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
    };
}

// ----------------------------------------------- //
