import * as zod from "zod";

export const ZodVector3 = zod.object({
	x: zod.number(),
	y: zod.number(),
	z: zod.number()
});

export const ZodKeysUpdate = zod.object({
	up: zod.object({
		event: zod.enum(["keyDown", "keyUp"]),
	}).optional(),
	down: zod.object({
		event: zod.enum(["keyDown", "keyUp"]),
	}).optional(),
});

export const ZodGoal = zod.object({
	side: zod.enum(["right", "left"]),
});

export const ZodItemsUpdate = zod.object({
	paddleRightPos: ZodVector3,
	paddleLeftPos: ZodVector3,
	ball: zod.object({
		pos: ZodVector3,
		linearVelocity: ZodVector3,
	}),
});
export type KeysUpdate = zod.infer<typeof ZodKeysUpdate>;

export const ZodGameInfos = zod.discriminatedUnion("type", [
	zod.object({
		type: zod.literal("itemsUpdate"),
		infos: ZodItemsUpdate,
	}),
	zod.object({
		type: zod.literal("goal"),
		infos: ZodGoal,
	}),
	zod.object({
		type: zod.literal("input"),
		infos: ZodKeysUpdate,
	}),
]);
export type GameInfos = zod.infer<typeof ZodGameInfos>;

export const ZodGameInit = zod.object({
	playerIndex: zod.int().min(0).max(1)
})
export type GameInit = zod.infer<typeof ZodGameInit>;

