export interface FriendProfile
{
    id:             number,
    username:       string,
    avatar:         string,
    isOnline:       boolean,
    requesterId:    number,
}

export interface ListFormat
{
    status:     string,
    updatedAt:  string,
    user:       FriendProfile | null,
}