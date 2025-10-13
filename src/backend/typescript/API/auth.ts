
// API register / login user

// represent an user in the database
export interface user
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

// data received from the front request

export interface registerUser
{
    username:   string,
    email:      string,
    password:   string,
    avatar:     string
};

export interface LoginRequest
{
    email:      string,
    password:   string
};

// ----------------------------------------------- //

// response from the backend

export interface authResponse
{
    success:    boolean,
    message:    string,         // message from the backend for user (on success or fail)
    user?:                      // user information (on success)
    {
        id:         number,
        username:   string,
        email:      string,
        avatar:     string
    };
};
