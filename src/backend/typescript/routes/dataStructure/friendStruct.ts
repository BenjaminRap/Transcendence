// ----------------------------------------------- //

import { FriendsData } from "./commonStruct.js"

export interface Friend
{
    id:         number,
    userAId:    number,
    userBId:    number,
    status:     FriendshipStatus,
}

export enum FriendshipStatus
{
    PENDING,
    ACCEPTED,
    BLOCKED
}

export interface FriendshipRequest
{
    requesterId:    number,
    receiverId:     number
}

export interface FriendsResponse
{
    success:    boolean,
    message:    string,
    friend:     Friend
}

// ----------------------------------------------- //

export interface FriendshipResponse
{
    success:    boolean,
    message:    string
}

export function sanitizeFriends(friends: FriendsData) : Friend {
    return {
        id: friends.id,
        userAId: friends.userAId,
        userBId: friends.userBId,
        status: friends.status
    };
}