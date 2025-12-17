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
    winnerId?:      number | null,
    winnerLevel?:   OPPONENT_LEVEL| null,

    loserId?:       number | null,
    loserLevel?:    OPPONENT_LEVEL | string,
    
    scoreWinner:    number,
    scoreLoser:     number,
    
    duration:       number,
    
    tournamentId?:  number | null,
}
