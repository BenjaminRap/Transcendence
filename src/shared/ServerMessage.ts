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
		type: zod.literal("itemsUpdate"),
		infos: zodItemsUpdate,
	}),
	zod.object({
		type: zod.literal("goal"),
		infos: zodGoal,
	}),
	zod.object({
		type: zod.literal("input"),
		infos: zodKeysUpdate,
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
	maxPlayerCount: zod.number().min(2).max(TournamentHelper.maxTournamentParticipants)
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
