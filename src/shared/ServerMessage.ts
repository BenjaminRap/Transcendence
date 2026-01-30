import zod from "zod";
import { zodForceDisconnectReason, zodFriendStatusUpdate, zodGameInfos, zodGameInit, zodGameStartInfos, zodGameStats, zodMatchSummary, zodSanitizedUser, zodTournamentEvent, zodUserStatusChange } from "./ZodMessageType";

export const serverMessages = ["game-infos",
							"joined-game",
							"ready",
							"tournament-event",
                            "user-status-change" ,
                            "profile-update" ,
                            "game-stats-update",
							"friend-status-update",
							"init",
							"force-disconnect",
							"match-update",
							"stat-update"] as const;

export const zodServerMessageData = {
	"game-infos" : [zodGameInfos],
	"joined-game" : [zodGameInit],
	"tournament-event" : [zodTournamentEvent],
    "user-status-change" : [zodUserStatusChange],
    "profile-update" : [zodSanitizedUser],
    "game-stats-update" : [zod.object({ stats: zodGameStats })],
	"friend-status-update" : [zodFriendStatusUpdate],
	"ready" : [zodGameStartInfos],
	"init" : [zod.string()],
	"force-disconnect" : [zodForceDisconnectReason],
	"match-update": [zodMatchSummary],
	"stat-update": [zodGameStats]
} satisfies {
  readonly [key : string]: readonly [zod.ZodTypeAny, ...zod.ZodTypeAny[]];
}
