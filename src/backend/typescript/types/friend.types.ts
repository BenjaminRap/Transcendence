export interface FriendProfile
{
    id:         string,
    username:   string,
    avatar:     string
}

export interface ListFormat
{
    status:     string,
    updatedAt:  string,
    user:       FriendProfile,
    
}