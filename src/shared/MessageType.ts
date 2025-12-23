import type { GameInfos, GameInit, KeysUpdate } from "./ServerMessage";

export type ClientMessage = "join-matchmaking" | "ready" | "input-infos" | "forfeit" | "leave-matchmaking"
export type ClientMessageData<T extends ClientMessage> = T extends "input-infos" ? KeysUpdate : undefined;

export type ServerEvents = "game-infos" | "joined-game" | "ready" | "forfeit" | "room-closed" | "user-status-change";

export type UserStatusChange = { userId: number, status: 'online' | 'offline' };

export type ServerEventsData<T extends ServerEvents> =
    T extends "game-infos" ? GameInfos :
    T extends "joined-game" ? GameInit :
    T extends "user-status-change" ? UserStatusChange :
    undefined


export type ClientToServerEvents = {
    [T in ClientMessage]: ClientMessageData<T> extends undefined ?
        () => void :
        (data: ClientMessageData<T>) => void;
} & {
    "get-online-users": (callback: (users: number[]) => void) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: ServerEventsData<T> extends undefined ?
        () => void :
        (data: ServerEventsData<T>) => void;
};
