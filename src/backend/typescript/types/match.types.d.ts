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
