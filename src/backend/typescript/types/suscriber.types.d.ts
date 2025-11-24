import { GameStats } from "./match.types.d.js"
import { Match, Friendship } from "@prisma/client";

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
