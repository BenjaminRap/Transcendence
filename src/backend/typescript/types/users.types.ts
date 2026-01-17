import type { GameStats, MatchSummary } from "./match.types"
import type { Match } from "@prisma/client"

export interface PublicProfile
{
    id:         number,
    avatar:     string,
    username:   string,
	stats: 		GameStats,
	lastMatchs: MatchSummary[],
    isFriend:   boolean
}
