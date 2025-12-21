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

export interface SuscriberStats
{
    gamesPlayed: number,
    gamesWon:    number,
    winRate:     number,
}

export interface SuscriberProfile
{
    id:         string,
    avatar:     string,
    username:   string,
    gameStats:  GameStats,
    lastMatchs: Match[],
    friends:    Friendship[],
}
