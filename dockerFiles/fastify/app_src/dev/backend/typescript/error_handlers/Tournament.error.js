export var TournamentError;
(function (TournamentError) {
    TournamentError["USER_NOT_FOUND"] = "User not found";
    TournamentError["INVALID_TOURNAMENT_ID"] = "Invalid Tournament Id";
    TournamentError["INVALID_MATCH_ID"] = "Invalid Match Id";
    TournamentError["TOURNAMENT_LIMIT_EXCEEDED"] = "Maximum number of participants exceeded";
    TournamentError["TOURNAMENT_CREATION_FAILED"] = "Tournament creation failed";
    TournamentError["INVALID_PARTICIPANT_COUNT"] = "Participants count must be a power of 2";
    TournamentError["INVALID_MATCHUPS_COUNT"] = "Invalid number of matchups";
    TournamentError["TOURNAMENT_NOT_FOUND"] = "Tournament not found";
    TournamentError["MATCH_NOT_FOUND"] = "Match not found";
    TournamentError["UNAUTHORIZED"] = "Unauthorized";
})(TournamentError || (TournamentError = {}));
export class TournamentException extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
        this.name = 'SuscriberException';
    }
}
