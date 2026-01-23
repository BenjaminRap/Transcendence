export interface MatchData
{
    leftId:          number| undefined,
    leftGuestName:   string,

    rightId:          number| undefined,
    rightGuestName:   string,

    winnerIndicator:  'left' | 'right' | 'draw',

    scoreLeft:	    number,
    scoreRight:	    number,
    duration:	    number,
}

export interface OpponentSummary
{
    id: number | undefined,
    username: string,   // guestname si id null sinon username courant
    avatar: string,     // default si id null
    isFriend: boolean,  // false si id null
}

export interface PlayerInfo {
    id:         number | undefined,
    guestName:  string, // username si id defini sinon guestname
}

export interface MatchResult
{
    matchId: number,
    scoreWinner: number,
    scoreLoser: number,
    duration: number,
    winnerName: string,
    loserName: string,
}

export interface MatchSummary
{
    opponent:       OpponentSummary,
    matchResult:    MatchResult,
}