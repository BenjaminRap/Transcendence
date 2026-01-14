import type { GameInfos, GameInit, KeysUpdate } from "./ServerMessage";
import type { SanitizedUser } from "../backend/typescript/types/auth.types.js";
import type { GameStats } from "../backend/typescript/types/match.types.js";

export type ClientMessage = "join-matchmaking" | 
                            "ready" | 
                            "input-infos" | 
                            "forfeit" | 
                            "leave-matchmaking" |
                            "force-disconnect";

export type ClientMessageData<T extends ClientMessage> = T extends "input-infos" ? KeysUpdate : undefined;

export type ServerEvents =  "game-infos" | 
                            "joined-game" | 
                            "ready" | 
                            "forfeit" | 
                            "room-closed" | 
                            "user-status-change" | 
                            "profile-update" | 
                            "game-stats-update" |
                            "account-deleted" |
							"friend-status-update";

export type ServerEventsData<T extends ServerEvents> =
    T extends "game-infos" ? GameInfos :
    T extends "joined-game" ? GameInit :
    T extends "user-status-change" ? { userId: number, status: 'online' | 'offline' } :
    T extends "profile-update" ? { user: SanitizedUser } :
    T extends "game-stats-update" ? { stats: GameStats } :
	T extends "friend-status-update" ? { fromUserId: number, status: 'PENDING' | 'ACCEPTED' } :
    undefined


export type ClientToServerEvents = {
    [T in ClientMessage]: ClientMessageData<T> extends undefined ?
        () => void :
        (data: ClientMessageData<T>) => void;
} & {
    "get-online-users": (callback: (users: number[]) => void) => void;
    "watch-profile": (profileId: number[]) => void;
    "unwatch-profile": (profileId: number[]) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: ServerEventsData<T> extends undefined ?
        () => void :
        (data: ServerEventsData<T>) => void;
};
