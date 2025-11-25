import { GameStats } from "./match.types.d.js"
import { Match } from "@prisma/client"

export interface PublicProfile
{
    id:         number,
    avatar:     string,
    username:   string,
	stats: 		GameStats,
	lastMatchs: Match[]
}

export interface UserSearchResult
{
	id:       number,
	username: string,
	avatar:   string
}
