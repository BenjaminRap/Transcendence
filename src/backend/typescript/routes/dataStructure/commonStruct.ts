import { FriendshipStatus } from './friendStruct.js'
// ----------------------------------------------- //

export interface User
{
    id:         number,
    username:   string,
    email:      string,
    password:   string,
    avatar:     string,
    created_at: Date,
    updated_at: Date,
}

// ----------------------------------------------- //

export interface FriendsData
{
    id:         number,
    userAId:    number,
    userBId:    number,
    status:     FriendshipStatus,
    createdAt:  string,
    updatedAt:  string,
    
}

// ----------------------------------------------- //
