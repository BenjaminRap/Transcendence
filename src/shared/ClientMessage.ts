import zod from "zod";
import { zodKeysUpdate, zodProfile, zodTournamentCreationSettings, zodTournamentDescription, zodTournamentId} from "./ZodMessageType";
import { resultOf } from "./ZodHelper";

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

export const zodClientMessageData  = {
	"input-infos" : [zodKeysUpdate],
	"create-tournament" : [zodTournamentCreationSettings],
	"join-tournament" : [zodTournamentId] ,
	"ban-participant" : [zod.string()] ,
	"kick-participant" : [zod.string()] ,
	"watch-profile" : [zod.array(zod.number())] ,
	"unwatch-profile" : [zod.array(zod.number())] ,
    "authenticate" : [zod.object({ token: zod.string() })] ,
    "set-alias" : [zod.string()]
} satisfies {
  readonly [key : string]: readonly [zod.ZodTypeAny, ...zod.ZodTypeAny[]];
}
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
