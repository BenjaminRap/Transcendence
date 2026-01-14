export interface FriendProfile
{
    id:         number,
    username:   string,
    avatar:     string,
    isOnline:   boolean,
}

export interface ListFormat
{
    status:     string,
    updatedAt:  string,
    user:       FriendProfile,
}