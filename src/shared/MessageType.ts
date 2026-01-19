import type { GameInfos, GameInit, GameStats, KeysUpdate, SanitizedUser, TournamentCreationSettings, TournamentDescription, TournamentEvent, TournamentId } from "./ServerMessage";
import type { Result } from "./utils";

export type ClientMessage = "join-matchmaking" |
							"ready" |
							"input-infos" |
							"forfeit" |
							"leave-matchmaking" |
							"create-tournament" |
							"start-tournament" |
							"join-tournament" |
							"leave-tournament" |
							"cancel-tournament" |
							"get-tournaments" |
							"ban-participant" |
							"kick-participant" |
							// "force-disconnect" |
							"get-online-users" |
							"watch-profile" |
							"unwatch-profile";

export type ClientMessageData<T extends ClientMessage> =
	T extends "input-infos" ? [KeysUpdate] :
	T extends "create-tournament" ? [TournamentCreationSettings, (tournamentId : Result<TournamentId>) => void] :
	T extends "start-tournament" ? [(result : Result<null>) => void] :
	T extends "join-tournament" ? [TournamentId, (participants : Result<string[]>) => void] :
	T extends "get-tournaments" ? [(descriptions : TournamentDescription[]) => void] :
	T extends "ban-participant" ? [string] :
	T extends "kick-participant" ? [string] :
	T extends "get-online-users" ? [(users: number[]) => void] :
	T extends "watch-profile" ? [profileId: number[]] :
	T extends "unwatch-profile" ? [profileId: number[]] :
	[];

export type ServerEvents = "game-infos" |
							"joined-game" |
							"ready" |
							"tournament-event" |
                            "user-status-change" | 
                            "profile-update" | 
                            "game-stats-update" |
                            "account-deleted" |
							"friend-status-update";

export type ServerEventsData<T extends ServerEvents> =
	T extends "game-infos" ? [GameInfos] :
	T extends "joined-game" ? [GameInit] :
	T extends "tournament-event" ? [TournamentEvent] : 
    T extends "user-status-change" ? [{ userId: number, status: 'online' | 'offline' }] :
    T extends "profile-update" ? [{ user: SanitizedUser }] :
    T extends "game-stats-update" ? [{ stats: GameStats }] :
	T extends "friend-status-update" ? [{ fromUserId: number, status: 'PENDING' | 'ACCEPTED' }] :
	[]


export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageData<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: (...data: ServerEventsData<T>) => void;
};
