import type { GameInfos, GameInit, GameStartInfos, GameStats, KeysUpdate, Profile, SanitizedUser, TournamentCreationSettings, TournamentDescription, TournamentEvent, TournamentId, Username } from "./ServerMessage";
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
							"logout" |
							"get-online-users" |
							"watch-profile" |
							"unwatch-profile" |
                            "authenticate" |
							"set-alias";

export type ClientMessageData<T extends ClientMessage> =
	T extends "input-infos" ? [KeysUpdate] :
	T extends "create-tournament" ? [TournamentCreationSettings] :
	T extends "join-tournament" ? [TournamentId] :
	T extends "ban-participant" ? [string] :
	T extends "kick-participant" ? [string] :
	T extends "watch-profile" ? [profileId: number[]] :
	T extends "unwatch-profile" ? [profileId: number[]] :
    T extends "authenticate" ? [data: { token: string }] :
    T extends "set-alias" ? [alias: Username] :
	[];

export type ClientMessageAcknowledgement<T extends ClientMessage> = 
	T extends "create-tournament" ? (tournamentId : Result<TournamentId>) => void :
	T extends "start-tournament" ? (result : Result<null>) => void :
	T extends "join-tournament" ? (participants : Result<Profile[]>) => void :
	T extends "get-tournaments" ? (descriptions : Result<TournamentDescription[]>) => void :
	T extends "get-online-users" ? (users: number[]) => void :
    T extends "authenticate" ? (result: Result<null>) => void :
    T extends "set-alias" ? (result : Result<null>) => void :
    T extends "join-matchmaking" ? (result : Result<null>) => void :
	undefined;

export type ClientMessageParameters<T extends ClientMessage> =
	ClientMessageAcknowledgement<T> extends undefined ? ClientMessageData<T> :
	[...ClientMessageData<T>, ClientMessageAcknowledgement<T>];

export type ServerEvents = "game-infos" |
							"joined-game" |
							"ready" |
							"tournament-event" |
                            "user-status-change" | 
                            "profile-update" | 
                            "game-stats-update" |
                            "account-deleted" |
							"friend-status-update" |
							"init";

export type ServerEventsData<T extends ServerEvents> =
	T extends "game-infos" ? [GameInfos] :
	T extends "joined-game" ? [GameInit] :
	T extends "tournament-event" ? [TournamentEvent] : 
    T extends "user-status-change" ? [{ userId: number, status: 'online' | 'offline' }] :
    T extends "profile-update" ? [{ user: SanitizedUser }] :
    T extends "game-stats-update" ? [{ stats: GameStats }] :
	T extends "friend-status-update" ? [{ fromUserId: number, status: 'PENDING' | 'ACCEPTED' }] :
	T extends "ready" ? [GameStartInfos] :
	T extends "init" ? [guestName: string] :
	[];

export type ServerEventsAcknowledgement<T extends ServerEvents> = 
	undefined;

export type ServerEventsParameters<T extends ServerEvents> =
	ServerEventsAcknowledgement<T> extends undefined ? ServerEventsData<T> :
	[...ServerEventsData<T>, ServerEventsAcknowledgement<T>];


export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageParameters<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: (...data: ServerEventsParameters<T>) => void;
};
