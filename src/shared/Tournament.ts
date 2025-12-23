import { Match } from "./Match";
import type { Profile } from "./Profile";
import { isPowerOfTwo } from "./utils";

export abstract class	Tournament
{
	protected static createQualificationMatches(profiles : Profile[])
	{
		if (profiles.length < 2)
			throw new Error(`The profiles should be greater than 1, got ${profiles.length}`);
		const	matches = [];

		for (let index = 0; index < profiles.length; index++) {
			const	opponentLeftIndex = index;
			const	opponentRightIndex = (index + 1) % profiles.length;
			const	match = new Match(profiles[opponentLeftIndex], profiles[opponentRightIndex]);

			matches.push(match);
		}
		return matches;
	}

	protected static	createTournamentMatches(profiles : Profile[]) : Match[][]
	{
		if (profiles.length < 2 || !isPowerOfTwo(profiles.length))
			throw new Error(`The profiles should be a power of two, greater than 1, got ${profiles.length}`);
		return this.createMatchesByRoundRecursive(profiles);
	}

	protected static createMatchesByRoundRecursive(participants : Profile[] | Match[]) : Match[][]
	{
		if (participants.length === 1)
			return [];
		const	matches : Match[] = [];

		for (let index = 0; index < participants.length / 2; index++) {
			matches.push(new Match(participants[index * 2], participants[index * 2 + 1]))
		}
		const	matchesByRounds = this.createMatchesByRoundRecursive(matches);

		matchesByRounds.push(matches);
		return matchesByRounds;
	}

	public abstract start() : void;
}
