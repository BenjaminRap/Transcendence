import type { EndData } from "./attachedScripts/GameManager";
import { Match } from "./Match";
import type { Profile } from "./Profile";
import { isPowerOfTwo, shuffle } from "./utils";

export abstract class	Tournament
{
	protected static createQualificationMatches(profiles : Profile[])
	{
		if (profiles.length < 2)
			throw new Error(`The profiles should be greater than 1, got ${profiles.length}`);
		shuffle(profiles);
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
		shuffle(profiles);
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

		matchesByRounds.unshift(matches);
		return matchesByRounds;
	}

	protected static setQualifiedParticipants(qualified : Profile[], participants : Profile[], expectedQualified : number)
	{
		if (qualified.length >= expectedQualified)
			return;
		const	participantsToQualify = expectedQualified - qualified.length;

		participants.sort((a, b) => b.score - a.score);
		console.log(JSON.stringify(participants));

		const	lastQualifiedIndex = participantsToQualify - 1;
		const	lastQualifiedScore = participants[lastQualifiedIndex].score;
		const	firstWithSameScore = participants.findIndex((value) => value.score === lastQualifiedScore);
		const	lastWithSameScore = participants.findLastIndex((value) => value.score === lastQualifiedScore);

		if (lastQualifiedIndex === lastWithSameScore)
		{
			qualified.push(...participants.splice(0, participantsToQualify))
			participants = [];
		}
		else
		{
			qualified.push(...participants.splice(0, firstWithSameScore));
			participants.splice(lastWithSameScore + 1);
		}
	}

	protected static getExpectedQualified(participantCount : number)
	{
		let	expectedQualified = 2;

		while (expectedQualified * 2 <= participantCount)
		{
			expectedQualified *= 2;
		}
		return expectedQualified;
	}

	public abstract start() : void;
	public abstract onGameEnd(endData : EndData) : void;
	public abstract dispose() : void;
}
