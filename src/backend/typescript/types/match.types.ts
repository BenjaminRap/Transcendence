export interface MatchData
{
    winnerId:           number| undefined,
    winnerGuestName:    string,
    loserId:            number| undefined,
    loserGuestName:     string,
    scoreWinner:	    number,
    scoreLoser:	        number,
    duration:	        number,
}

export interface OpponentSummary
{
    id: number | undefined,
    username: string,
    avatar: string,
    isFriend: boolean,
}

export interface PlayerInfo {
    id:         number | undefined,
    guestName:  string,
}

export interface MatchResult
{
    matchId: number,
    scoreWinner: number,
    scoreLoser: number,
    duration: number,
    winner: PlayerInfo,
    loser: PlayerInfo,
}

export interface MatchSummary
{
    opponent?: OpponentSummary,
    matchResult: MatchResult,
}