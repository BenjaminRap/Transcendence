
// API register / login user

export interface Tokens
{
    token:          string,
    refresh_token:  string
};

export interface User
{
    id:         number,
    username:   string,
    email:      string,
    password:   string,
    avatar:     string,
    created_at: Date,
    updated_at: Date,
    is_online:  boolean
};

// ----------------------------------------------- //

export interface RegisterUser
{
    username:   string,
    email:      string,
    password:   string,
    avatar:     string
};

export interface LoginRequest
{
    identifier: string,
    password:   string
};

export interface UpdateUser
{
    username?:  string,
    password?:  string,
    avatar?:    string
};

// ----------------------------------------------- //

export interface AuthResponse
{
    success:    boolean,
    message:    string,
    user?:
    {
        id:         number,
        username:   string,
        email:      string,
        avatar:     string
    },
    tokens?:        Tokens
};
