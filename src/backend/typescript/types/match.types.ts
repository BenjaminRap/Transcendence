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
    createdAt: any;
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
    match:    MatchResult,
}