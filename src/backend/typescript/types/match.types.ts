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




export interface PlayerInfo {
    id?: number,
    level?: string,
}

export interface StartMatchData {
    player1: PlayerInfo,
    player2: PlayerInfo,
}

export interface EndMatchData {
    matchId:	    number,
    winner:         PlayerInfo,
    loser:          PlayerInfo,
    scoreWinner:	number,
    scoreLoser:	    number,
    duration:	    number,
}

export interface MatchData
{
    matchId:        number,
    player1Info:  PlayerInfo,
    player2Info:  PlayerInfo,
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
    AI = "AI",
}

export interface MatchTournamentData extends MatchData
{
    tournamentId:  number,
}
