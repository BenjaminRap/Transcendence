import { Paddle } from "@shared/attachedScripts/Paddle";

export const botDifficulty  = {
	"easy": {
		refreshIntervalMs: 1300,
		maxReboundCalculationRecursion: 1,
		shootAtOppositeProbability: 0,
		rangeForRandom: Paddle.range * 0.25
	},
	"normal": {
		refreshIntervalMs: 1200,
		maxReboundCalculationRecursion: 2,
		shootAtOppositeProbability: 0.2,
		rangeForRandom: Paddle.range * 0.5
	},
	"hard": {
		refreshIntervalMs: 1000,
		maxReboundCalculationRecursion: 4,
		shootAtOppositeProbability: 0.5,
		rangeForRandom: Paddle.range
	}
}

export type	BotDifficulty = typeof botDifficulty;
