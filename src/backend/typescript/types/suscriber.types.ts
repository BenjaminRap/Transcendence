import type { GameStats } from "./match.types"
import type { Match, Friendship } from "@prisma/client";

export interface UpdateData
{
    username?:  string,
    avatar?:    string,
}

export interface UpdatePassword
{
    currentPassword:    string,
    newPassword:        string,
    confirmNewPassword: string
}

export interface DeleteAccount
{
    tokenKey:       string,
    confirmChoice:  boolean,
}

export interface Friend
{
    avatar:     string,
    username:   string,
    id:         string,
    status:     string,
    isOnline:   boolean,
}

export interface MatchSummary
{
        opponent: { id: string, username: string, avatar: string,} | null,
        match: Match | null,
}

export interface SuscriberProfile
{
    id:         string,
    avatar:     string,
    username:   string,
    gameStats:  GameStats,
    lastMatchs: MatchSummary[],
    friends:    Friend[],
}
