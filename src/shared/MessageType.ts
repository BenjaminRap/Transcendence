import zod from "zod";
import { funcOf, resultOf, zodGameInfos, zodGameInit, zodGameStartInfos, zodGameStats, zodKeysUpdate, zodProfile, zodSanitizedUser, zodTournamentCreationSettings, zodTournamentDescription, zodTournamentEvent, zodTournamentId} from "./ServerMessage";
import { CommonSchema } from "./common.schema";

type InferParams<T, K, DefaultValue> =
  T extends keyof K
    ? zod.infer<K[T]>
    : DefaultValue;

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

export const zodClientMessageData = {
	"input-infos" : zod.tuple([zodKeysUpdate]),
	"create-tournament" : zod.tuple([zodTournamentCreationSettings]),
	"join-tournament" : zod.tuple([zodTournamentId]),
	"ban-participant" : zod.tuple([zod.string()]),
	"kick-participant" : zod.tuple([zod.string()]),
	"watch-profile" : zod.tuple([zod.array(zod.number())]),
	"unwatch-profile" : zod.tuple([zod.array(zod.number())]),
    "authenticate" : zod.tuple([zod.object({ token: zod.string() })]),
    "set-alias" : zod.tuple([CommonSchema.username])
}

export type ClientMessageData<T extends ClientMessage> = InferParams<T, typeof zodClientMessageData, []>;

export const zodClientMessageAcknowledgement = {
	"create-tournament": funcOf(resultOf(zodTournamentId)),
	"start-tournament": funcOf(resultOf(zod.null())),
	"join-tournament" : funcOf(resultOf(zod.array(zodProfile))),
	"get-tournaments" : funcOf(resultOf(zod.array(zodTournamentDescription))),
	"get-online-users" : funcOf(zod.array(zod.number())),
    "authenticate" : funcOf(resultOf(zod.null())),
    "set-alias" : funcOf(resultOf(zod.null())),
    "join-matchmaking" : funcOf(resultOf(zod.null()))
}

export type ClientMessageAcknowledgement<T extends ClientMessage> = InferParams<T, typeof zodClientMessageAcknowledgement, undefined>

export type ClientMessageParameters<T> =
	T extends (keyof typeof zodClientMessageAcknowledgement) ?
	[...InferParams<T, typeof zodClientMessageData, []>, InferParams<T, typeof zodClientMessageAcknowledgement, undefined>] :
	InferParams<T, typeof zodClientMessageData, []>;



export type ServerMessage = "game-infos" |
							"joined-game" |
							"ready" |
							"tournament-event" |
                            "user-status-change" | 
                            "profile-update" | 
                            "game-stats-update" |
                            "account-deleted" |
							"friend-status-update" |
							"init";

export const zodServerMessageData = {
	"game-infos" : zod.tuple([zodGameInfos]),
	"joined-game" : zod.tuple([zodGameInit]),
	"tournament-event" : zod.tuple([zodTournamentEvent]),
    "user-status-change" : zod.tuple([zod.object({ userId: zod.number(), status: zod.literal(['online', 'offline']) })]),
    "profile-update" : zod.tuple([zod.object({ user: zodSanitizedUser })]),
    "game-stats-update" : zod.tuple([zod.object({ stats: zodGameStats })]),
	"friend-status-update" : zod.tuple([zod.object({ fromUserId: zod.number(), status: zod.literal('PENDING', 'ACCEPTED')})]),
	"ready" : zod.tuple([zodGameStartInfos]),
	"init" : zod.tuple([zod.string()])
};
export type ServerMessageParameters<T extends ServerMessage> = InferParams<T, typeof zodServerMessageData, []>;

export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageParameters<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerMessage]: (...data: ServerMessageParameters<T>) => void;
};
