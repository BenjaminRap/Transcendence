// ----------------------------------------------- //

import { FriendsData } from './commonStruct.js'
import { PublicProfile } from './usersStruct.js'
// ----------------------------------------------- //

export interface Friendship
{
    id:         number,
    userAId:    number,
    userBId:    number,
    status:     FriendshipStatus,
}

// ----------------------------------------------- //

export enum FriendshipStatus
{
    PENDING,
    ACCEPTED
}

// ----------------------------------------------- //

export interface FriendshipRequest
{
    requesterId:    number,
    receiverId:     number
}

// ----------------------------------------------- //

export interface FriendsResponse
{
    success:    boolean,
    message:    string,
    friendship: Friendship
}

// ----------------------------------------------- //

export interface FriendshipResponse
{
    success:    boolean,
    message:    string
}

// ----------------------------------------------- //

export interface PendingList
{
    createdAt:  string,
    user:       PublicProfile,
    recieved:   boolean
}

// ----------------------------------------------- //

interface FriendList
{
    updatedAt:  string,
    user:       PublicProfile,
}

// ----------------------------------------------- //

export interface PendingListResponse
{
    success:        boolean,
    message:        string,
    pendingList:    PendingList[]
}

// ----------------------------------------------- //

export interface FriendListResponse
{
    success:        boolean,
    message:        string,
    friendList:     FriendList[]
}

// ----------------------------------------------- //

export function sanitizeFriends(friends: FriendsData) : Friendship {
    return {
        id: friends.id,
        userAId: friends.userAId,
        userBId: friends.userBId,
        status: friends.status
    };
}