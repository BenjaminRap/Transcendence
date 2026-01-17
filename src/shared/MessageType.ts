import type { Profile } from "./Profile";
import type { GameInfos, GameInit, KeysUpdate, TournamentCreationSettings, TournamentDescription, TournamentId } from "./ServerMessage";
import type { Result } from "./utils";

export type ClientMessage = "join-matchmaking" | "ready" | "input-infos" | "forfeit" | "leave-matchmaking" | "create-tournament" | "start-tournament" | "join-tournament" | "leave-tournament" | "cancel-tournament" | "get-tournaments" | "ban-participant";
export type ClientMessageData<T extends ClientMessage> =
	T extends "input-infos" ? [KeysUpdate] :
	T extends "create-tournament" ? [TournamentCreationSettings, (tournamentId : Result<TournamentId>) => void] :
	T extends "start-tournament" ? [(result : Result<null>) => void] :
	T extends "join-tournament" ? [TournamentId, (participants : Result<Profile[]>) => void] :
	T extends "get-tournaments" ? [(descriptions : TournamentDescription[]) => void] :
	[];

export type ServerEvents = "game-infos" | "joined-game" | "ready" | "forfeit" | "room-closed" | "tournament-canceled" | "add-participant" | "remove-participant" | "kicked" | "banned";
export type ServerEventsData<T extends ServerEvents> =
	T extends "game-infos" ? [GameInfos] :
	T extends "joined-game" ? [GameInit] :
	T extends "add-participant" ? [Profile] :
	T extends "remove-participant" ? [Profile] :
	[]


export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageData<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerEvents]: (...data: ServerEventsData<T>) => void;
};
