<<<<<<< HEAD
import { GameStats } from "./match.types.js"
import { Match } from "@prisma/client"
=======
import type { GameStats } from "./match.types"
import type { Match } from "@prisma/client"
>>>>>>> origin/Tournament

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
