import zod from "zod";
import { zodGameInfos, zodGameInit, zodGameStartInfos, zodGameStats, zodSanitizedUser, zodTournamentEvent } from "./ZodMessageType";

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
