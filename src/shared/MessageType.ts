import { GameInfos, GameInit, KeysUpdate } from "./ServerMessage";

export type ClientMessage = "join-matchmaking" | "ready" | "input-infos" | "forfeit" | "leave-matchmaking"
export type ClientMessageData<T extends ClientMessage> = T extends "input-infos" ? KeysUpdate : undefined;

export type ServerEvents = "game-infos" | "joined-game" | "ready" | "forfeit" | "room-closed";
export type ServerEventsData<T extends ServerEvents> =
	T extends "game-infos" ? GameInfos :
	T extends "joined-game" ? GameInit :
	undefined


export type ClientToServerEvents = {
    [T in ClientMessage]: ClientMessageData<T> extends undefined ?
		() => void :
		(data: ClientMessageData<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: ServerEventsData<T> extends undefined ?
		() => void :
		(data: ServerEventsData<T>) => void;
};
