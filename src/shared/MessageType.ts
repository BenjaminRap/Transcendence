import zod from "zod";
import { resultOf, zodGameInfos, zodGameInit, zodGameStartInfos, zodGameStats, zodKeysUpdate, zodProfile, zodSanitizedUser, zodTournamentCreationSettings, zodTournamentDescription, zodTournamentEvent, zodTournamentId} from "./ZodMessageType";
import { CommonSchema } from "./common.schema";

type InferArray<T extends readonly zod.ZodType[]> = {
	[K in keyof T]: zod.infer<T[K]>
};

type InferZodAck<F> =
  F extends zod.ZodFunction<infer Args, infer Ret>
    ? (...args: zod.infer<Args>) => zod.infer<Ret>
    : never;

function isKey<T extends object, K extends PropertyKey>(
    key: K,
    object: T
): key is K & keyof T {
    return key in object;
}

export const clientMessages = ["join-matchmaking",
							"ready",
							"input-infos",
							"forfeit",
							"leave-matchmaking",
							"create-tournament",
							"start-tournament",
							"join-tournament",
							"leave-tournament",
							"cancel-tournament",
							"get-tournaments",
							"ban-participant",
							"kick-participant",
							"logout",
							"get-online-users",
							"watch-profile",
							"unwatch-profile",
                            "authenticate",
							"set-alias"] as const;

export function	isClientMessage(eventName : string) : eventName is ClientMessage
{
	return clientMessages.find(value => value === eventName) !== undefined;
}

export type ClientMessage = typeof clientMessages[number];

export const zodClientMessageData  = {
	"input-infos" : [zodKeysUpdate],
	"create-tournament" : [zodTournamentCreationSettings],
	"join-tournament" : [zodTournamentId] ,
	"ban-participant" : [zod.string()] ,
	"kick-participant" : [zod.string()] ,
	"watch-profile" : [zod.array(zod.number())] ,
	"unwatch-profile" : [zod.array(zod.number())] ,
    "authenticate" : [zod.object({ token: zod.string() })] ,
    "set-alias" : [CommonSchema.username]
} satisfies {
  readonly [key : string]: readonly [zod.ZodTypeAny, ...zod.ZodTypeAny[]];
}

export type ZodClientMessageData<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageData
    ? (typeof zodClientMessageData)[T]
    : [];

export type ClientMessageData<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageData
    ? InferArray<(typeof zodClientMessageData)[T]>
    : [];

export const zodClientMessageAcknowledgementParameters = {
	"create-tournament": [resultOf(zodTournamentId)],
	"start-tournament": [resultOf(zod.null())],
	"join-tournament" : [resultOf(zod.array(zodProfile))],
	"get-tournaments" : [resultOf(zod.array(zodTournamentDescription))],
	"get-online-users" : [(zod.array(zod.number()))],
    "authenticate" : [resultOf(zod.null())],
    "set-alias" : [resultOf(zod.null())],
    "join-matchmaking" : [resultOf(zod.null())]
} satisfies {
  readonly [key : string]: readonly [zod.ZodTypeAny, ...zod.ZodTypeAny[]];
}

export type ClientMessageAcknowledgementParameters<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageAcknowledgementParameters
    ? InferArray<(typeof zodClientMessageAcknowledgementParameters)[T]>
    : undefined;

export const zodClientMessageAcknowledgement = Object.fromEntries(
	Object.entries(zodClientMessageAcknowledgementParameters).map(([key, value]) => {
		return [key, zod.function({input: value, output: zod.void()})]
	})
) as unknown as {
	[T in keyof typeof zodClientMessageAcknowledgementParameters]: zod.ZodFunction<
		zod.ZodTuple<(typeof zodClientMessageAcknowledgementParameters)[T], null>
		, zod.ZodVoid>
}

export type ZodClientMessageAcknowledgement<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageAcknowledgement
    ? (typeof zodClientMessageAcknowledgement)[T]
	: undefined;

export type ClientMessageAcknowledgement<T extends ClientMessage> =
  T extends keyof typeof zodClientMessageAcknowledgement
    ? InferZodAck<(typeof zodClientMessageAcknowledgement)[T]>
	: undefined;

export const zodClientMessageParameters = Object.fromEntries(
	clientMessages.map(event => {
		const	types : zod.ZodType[] = [];

		if (isKey(event, zodClientMessageData))
			types.push(...zodClientMessageData[event]);
		if (isKey(event, zodClientMessageAcknowledgement))
			types.push(zodClientMessageAcknowledgement[event]);

		return [event, zod.tuple(types as any)];
	})
) as unknown as {
	[T in ClientMessage]: zod.ZodTuple<[...SetInArray<ZodClientMessageData<T>>, ...SetInArray<ZodClientMessageAcknowledgement<T>>], null>

}

type SetInArray<Value> = Value extends any[] ? Value : Value extends undefined ? [] : [Value];

export type ClientMessageParameters<T extends ClientMessage> = 
	[...SetInArray<ClientMessageData<T>>, ...SetInArray<ClientMessageAcknowledgement<T>>]

export const serverMessages = ["game-infos",
							"joined-game",
							"ready",
							"tournament-event",
                            "user-status-change" ,
                            "profile-update" ,
                            "game-stats-update",
                            "account-deleted",
							"friend-status-update",
							"init"] as const;

export type ServerMessage = typeof serverMessages[number];

export const zodServerMessageData = {
	"game-infos" : [zodGameInfos],
	"joined-game" : [zodGameInit],
	"tournament-event" : [zodTournamentEvent],
    "user-status-change" : [zod.object({ userId: zod.number(), status: zod.literal(['online', 'offline']) })],
    "profile-update" : [zod.object({ user: zodSanitizedUser })],
    "game-stats-update" : [zod.object({ stats: zodGameStats })],
	"friend-status-update" : [zod.object({ fromUserId: zod.number(), status: zod.literal('PENDING', 'ACCEPTED')})],
	"ready" : [zodGameStartInfos],
	"init" : [zod.string()]
} satisfies {
  readonly [key : string]: readonly [zod.ZodTypeAny, ...zod.ZodTypeAny[]];
}

export type ServerMessageData<T extends ServerMessage> =
  T extends keyof typeof zodServerMessageData
    ? InferArray<(typeof zodServerMessageData)[T]>
    : [];

export type ZodServerMessageData<T extends ServerMessage> =
  T extends keyof typeof zodServerMessageData
    ? (typeof zodServerMessageData)[T]
    : [];

export const zodServerMessageParameters = Object.fromEntries(
	serverMessages.map(event => {
		const	types : zod.ZodType[] = [];

		if (isKey(event, zodServerMessageData))
			types.push(...zodServerMessageData[event]);

		return [event, zod.tuple(types as any)];
	})
) as unknown as {
	[T in ServerMessage]: zod.ZodTuple<SetInArray<ZodServerMessageData<T>>, null>
}

export type ServerMessageParameters<T extends ServerMessage> = ServerMessageData<T>;

export type ClientToServerEvents = {
    [T in ClientMessage]: (...data: ClientMessageParameters<T>) => void;
};

export type ServerToClientEvents = {
    [T in ServerMessage]: (...data: ServerMessageParameters<T>) => void;
};

export function	parseClientMessageParameters<T extends ClientMessage>(event : T, ...args : any[])
{
	const	zodChecker = zodClientMessageParameters[event];
	const	result = zodChecker.safeParse(args);

	return result;
}
