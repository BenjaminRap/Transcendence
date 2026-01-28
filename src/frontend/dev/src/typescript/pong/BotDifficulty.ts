import { Paddle } from "@shared/attachedScripts/Paddle";

export const botDifficulty  = {
	"easy": {
		refreshIntervalMaxAdditionMs: 600,
		maxReboundCalculationRecursion: 1,
		shootAtOppositeProbability: 0,
		rangeForRandom: Paddle.range * 0.25
	},
	"normal": {
		refreshIntervalMaxAdditionMs: 300,
		maxReboundCalculationRecursion: 2,
		shootAtOppositeProbability: 0.2,
		rangeForRandom: Paddle.range * 0.5
	},
	"hard": {
		refreshIntervalMaxAdditionMs: 100,
		maxReboundCalculationRecursion: 4,
		shootAtOppositeProbability: 0.5,
		rangeForRandom: Paddle.range
	}
}

export type	BotDifficulty = typeof botDifficulty;
