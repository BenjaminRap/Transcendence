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
