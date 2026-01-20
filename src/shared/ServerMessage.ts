import * as zod from "zod";
import { TournamentHelper } from "./TournamentHelper";

export const zodVector3 = zod.object({
	x: zod.number(),
	y: zod.number(),
	z: zod.number()
});

export const zodKeysUpdate = zod.object({
	up: zod.object({
		event: zod.enum(["keyDown", "keyUp"]),
	}).optional(),
	down: zod.object({
		event: zod.enum(["keyDown", "keyUp"]),
	}).optional(),
});

export const zodGoal = zod.object({
	side: zod.enum(["right", "left"]),
	newBallDirection: zodVector3
});

export const zodItemsUpdate = zod.object({
	paddleRightPos: zodVector3,
	paddleLeftPos: zodVector3,
	ball: zod.object({
		pos: zodVector3,
		linearVelocity: zodVector3,
	}),
});
export type KeysUpdate = zod.infer<typeof zodKeysUpdate>;

export const zodGameInfos = zod.discriminatedUnion("type", [
	zod.object({
		type: zod.literal("forfeit")
	}),
	zod.object({
		type: zod.literal("room-closed")
	}),
	zod.object({
		type: zod.literal("itemsUpdate"),
		itemsUpdate: zodItemsUpdate,
	}),
	zod.object({
		type: zod.literal("goal"),
		goal: zodGoal,
	}),
	zod.object({
		type: zod.literal("input"),
		keysUpdate: zodKeysUpdate,
	}),
]);
export type GameInfos = zod.infer<typeof zodGameInfos>;

const	zodProfile = zod.object({
	name: zod.string(),
	image: zod.string()
});

const	zodPlayerIndex = zod.int().min(0).max(1);

export const zodGameInit = zod.object({
	playerIndex: zodPlayerIndex,
	participants: zod.array(zodProfile).length(2)
})
export type GameInit = zod.infer<typeof zodGameInit>;

export const	zodTournamentCreationSettings = zod.object({
	name: zod.string().trim().max(TournamentHelper.maxNameLength).nonempty(),
	isPublic: zod.boolean(),
	maxPlayerCount: zod.number().min(2).max(TournamentHelper.maxTournamentParticipants),
	acceptGuests: zod.boolean()
});
export type TournamentCreationSettings = zod.infer<typeof zodTournamentCreationSettings>;

export const	zodTournamentId = zod.string().nonempty();
export type TournamentId = zod.infer<typeof zodTournamentId>;

export const	zodTournamentDescription = zod.object({
	name: zod.string().trim().max(TournamentHelper.maxNameLength).nonempty(),
	currentPlayerCount: zod.number().min(2).max(TournamentHelper.maxTournamentParticipants),
	maxPlayerCount: zod.number().min(2).max(TournamentHelper.maxTournamentParticipants),
	id: zodTournamentId
}).refine((data) => data.currentPlayerCount <= data.maxPlayerCount, {
	message: "currentPlayerCount should not be greater than maxPlayerCount !",
	path: [ "currentPlayerCount" ]
});
export type TournamentDescription = zod.infer<typeof zodTournamentDescription>;

export const	zodMatchWinningDescription = zod.object({
	winner: zod.object({
		profile: zodProfile,
		score: zod.number()
	}).optional(),
	winnerSide: zod.literal(["left", "right"]).optional()
});
export type MatchWinningDescription = zod.infer<typeof zodMatchWinningDescription>;

export const	zodTournamentEvent = zod.discriminatedUnion("type", [
	zod.object({
		type: zod.literal("add-participant"),
		name: zod.string(),
		isCreator: zod.boolean()
	}),
	zod.object({
		type: zod.literal("remove-participant"),
		name: zod.string()
	}),
	zod.object({
		type: zod.literal("banned")
	}),
	zod.object({
		type: zod.literal("kicked")
	}),
	zod.object({
		type: zod.literal("tournament-canceled")
	}),
	zod.object({
		type: zod.literal("tournament-gui-create"),
		qualified: zod.array(zodProfile)
	}),
	zod.object({
		type: zod.literal("show-tournament")
	}),
	zod.object({
		type: zod.literal("tournament-gui-set-winners"),
		round: zod.number(),
		matches: zod.array(zodMatchWinningDescription)
	}),
	zod.object({
		type: zod.literal("win"),
		winner: zodProfile
	}),
	zod.object({
		type: zod.literal("lose"),
		round: zod.union([
			zod.literal("qualification"),
			zod.number()
		])
	}),
	zod.object({
		type: zod.literal("tournament-start")
	})
]);
export type TournamentEvent = zod.infer<typeof zodTournamentEvent>;

export const zodSanitizedUser = zod.object({
	id: zod.string(),
	username: zod.string(),
	avatar: zod.string()
});
export type SanitizedUser = zod.infer<typeof zodSanitizedUser>;

export const zodGameStats = zod.object({
	wins: zod.number(),
	losses: zod.number(),
	total: zod.number(),
	winRate: zod.number()
});
export type GameStats = zod.infer<typeof zodGameStats>;
