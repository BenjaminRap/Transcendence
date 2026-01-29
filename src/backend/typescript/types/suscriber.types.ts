import type { GameStats, MatchSummary } from "@shared/ZodMessageType.js";

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
    avatar:         string,
    username:       string,
    id:             number,
    status:         string,
    requesterId:    number,
    isOnline:       boolean,
}

export interface SuscriberProfile
{
    id:         number,
    avatar:     string,
    username:   string,
    gameStats:  GameStats,
    lastMatchs: MatchSummary[],
    friends:    Friend[],
}
