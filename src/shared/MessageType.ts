import type { GameInfos, GameInit, KeysUpdate, TournamentCreationSettings, TournamentDescription } from "./ServerMessage";

export type ClientMessage = "join-matchmaking" | "ready" | "input-infos" | "forfeit" | "leave-matchmaking" | "create-tournament" | "start-tournament" | "cancel-tournament" | "get-tournaments";
export type ClientMessageData<T extends ClientMessage> =
	T extends "input-infos" ? [KeysUpdate] :
	T extends "create-tournament" ? [TournamentCreationSettings, (error? : string) => void] :
	T extends "get-tournaments" ? [(descriptions : TournamentDescription[]) => void] :
	[];

export type ServerEvents = "game-infos" | "joined-game" | "ready" | "forfeit" | "room-closed";
export type ServerEventsData<T extends ServerEvents> =
	T extends "game-infos" ? [GameInfos] :
	T extends "joined-game" ? [GameInit] :
	[]


export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageData<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: (...data: ServerEventsData<T>) => void;
};
