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

export interface PlayerInfo {
    id:         number | undefined,
    guestName:  string,
}
