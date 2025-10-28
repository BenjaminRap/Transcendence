
// ----------------------------------------------- //

interface PersoProfile
{
    id:         number,
    username:   string,
    email:      string,
    avatar:     string,
    created_at: Date
    // connection status
}

// ----------------------------------------------- //

export interface PublicProfile
{
    id:         number,
    username:   string,
    avatar:     string,
    // connection status (only for friends)
}

// ----------------------------------------------- //

export interface UpdateData
{
    username?:  string,
    password?:  string,
    avatar?:    string
}

// ----------------------------------------------- //

export interface PersoProfileResponse
{
    success:    boolean,
    message:    string,
    user?:      PersoProfile
}

// ----------------------------------------------- //

export interface PublicProfileResponse
{
    success:    boolean,
    message:    string,
    user?:      PublicProfile
}

// ----------------------------------------------- //

export interface UpdateResponse
{
    success:    boolean,
    message:    string,
    redirectTo: string
}

// ----------------------------------------------- //

export interface searchedUserResponse
{
    success:        boolean,
    message:        string,
    usersFound?:   PublicProfile[]
}

// ----------------------------------------------- //

export function sanitizePersoProfile(user: any) : PersoProfile {
    return {
        id:         user.id,
        username:   user.username,
        email:      user.email,
        avatar:     user.avatar,
        created_at: user.created_at
    };
}

// ----------------------------------------------- //

export function sanitizePublicProfile(user: any) : PublicProfile {
    return {
        id:         user.id,
        username:   user.username,
        avatar:     user.avatar
    };
}

// ----------------------------------------------- //
