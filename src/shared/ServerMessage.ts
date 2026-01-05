import * as zod from "zod";
import { Tournament } from "./Tournament";

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

const	zodPlayerIndex = zod.int().min(0).max(1);

export const zodGameInit = zod.object({
	playerIndex: zodPlayerIndex
})
export type GameInit = zod.infer<typeof zodGameInit>;

export const	zodTournamentCreationSettings = zod.object({
	name: zod.string().trim().max(Tournament.maxNameLength).nonempty(),
	isPublic: zod.boolean(),
	maxPlayerCount: zod.number().min(2).max(Tournament.maxTournamentParticipants)
});
export type TournamentCreationSettings = zod.infer<typeof zodTournamentCreationSettings>;

export const	zodTournamentDescription = zod.object({
	name: zod.string().trim().max(Tournament.maxNameLength).nonempty(),
	currentPlayerCount: zod.number().min(2).max(Tournament.maxTournamentParticipants),
	maxPlayerCount: zod.number().min(2).max(Tournament.maxTournamentParticipants)
}).refine((data) => data.currentPlayerCount <= data.maxPlayerCount, {
	message: "currentPlayerCount should not be greater than maxPlayerCount !",
	path: [ "currentPlayerCount" ]
});
export type TournamentDescription = zod.infer<typeof zodTournamentDescription>;
