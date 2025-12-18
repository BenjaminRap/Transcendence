export interface GameStats
{
	wins:		number,
	losses:    	number,
	total:     	number,
	winRate:	number,
}

export interface MatchStats
{
	playerId:	number,
	stats:		GameStats,
}

interface OpponentInfo
{
	id:			number,
	username:	string,
	avatar:		string,
}

export interface MatchHistoryEntry
{
	matchId:	number,
	opponent:	OpponentInfo,
	userResult:	'win' | 'loss',
	date:		Date,
}



export enum OPPONENT_LEVEL
{
    GUEST = "GUEST",
    AI_EASY = "AI_EASY",
    AI_MEDIUM = "AI_MEDIUM",
    AI_HARD = "AI_HARD"
}

export interface MatchData
{
    winnerId?:      number | undefined,
    winnerLevel?:   OPPONENT_LEVEL| string | undefined,

    loserId?:       number | undefined,
    loserLevel?:    OPPONENT_LEVEL | string | undefined,
    
    scoreWinner:    number,
    scoreLoser:     number,
    
    duration:       number,
    
    tournamentId?:  number | undefined,
}
