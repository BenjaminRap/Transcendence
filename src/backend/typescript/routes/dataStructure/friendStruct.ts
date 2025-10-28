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
    ACCEPTED,
    BLOCKED
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

export interface PendingListResponse
{
    success:        boolean,
    message:        string,
    pendingList:    PublicProfile[]
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