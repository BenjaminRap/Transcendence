export interface FriendProfile
{
    id:         number,
    username:   string,
    avatar:     string
}

export interface ListFormat
{
    status:     string,
    updatedAt:  string,
    user:       FriendProfile,
}