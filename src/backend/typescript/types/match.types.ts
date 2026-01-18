export enum OPPONENT_LEVEL
{
    GUEST = "GUEST",
    AI = "AI",
}

export interface GameStats
{
	wins:		number,
	losses:    	number,
	total:     	number,
	winRate:	number,
}

export interface PlayerInfo {
    id?: number,
    guestName?: string,
}

export interface StartMatchData {
    player1: PlayerInfo,
    player2: PlayerInfo,
}

export interface MatchData
{
    matchId:        number,
    player1Info:  PlayerInfo,
    player2Info:  PlayerInfo,
}

export interface EndMatchData {
    matchId:	    number,
    winner:         PlayerInfo,
    loser:          PlayerInfo,
    scoreWinner:	number,
    scoreLoser:	    number,
    duration:	    number,
}

export interface OpponentSummary
{
    id: string,
    username: string,
    avatar: string,
    isFriend: boolean,
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
