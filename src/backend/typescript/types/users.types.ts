import type { GameStats, MatchSummary } from "./match.types"

export interface PublicProfile
{
    id:         number,
    avatar:     string,
    username:   string,
	stats: 		GameStats,
	lastMatchs: MatchSummary[],
    isFriend:   boolean,
    isOnline:   boolean
}
