import { Match } from "./Match";
import { PongError } from "./pongError/PongError";
import type { Profile } from "./Profile";
import { isPowerOfTwo, shuffle } from "./utils";

export type ProfileWithScore = Profile & {
	score : number
}

export abstract class	TournamentHelper
{
	public static readonly maxTournamentParticipants = 64;
	public static readonly maxNameLength = 20;

	public static createQualificationMatches(participants : ProfileWithScore[])
	{
		if (participants.length < 2)
			throw new PongError(`The profiles should be greater than 1, got ${participants.length}`, "quitPong");
		shuffle(participants);
		const	matches = [];

		for (let index = 0; index < participants.length; index++) {
			const	opponentLeftIndex = index;
			const	opponentRightIndex = (index + 1) % participants.length;
			const	match = new Match(participants[opponentLeftIndex], participants[opponentRightIndex]);

			matches.push(match);
		}
		return matches;
	}

	public static	createTournamentMatches(profiles : ProfileWithScore[]) : Match[][]
	{
		if (profiles.length < 2 || !isPowerOfTwo(profiles.length))
			throw new PongError(`The profiles should be a power of two, greater than 1, got ${profiles.length}`, "quitPong");
		shuffle(profiles);
		return this.createMatchesByRoundRecursive(profiles);
	}

	public static createMatchesByRoundRecursive(participants : ProfileWithScore[] | Match[]) : Match[][]
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

	public static setQualifiedParticipants(qualified : ProfileWithScore[], participants : ProfileWithScore[], expectedQualified : number)
	{
		if (qualified.length >= expectedQualified)
			return;
		const	participantsToQualify = expectedQualified - qualified.length;

		participants.sort((a, b) => b.score - a.score);

		const	lastQualifiedIndex = participantsToQualify - 1;
		const	lastQualifiedScore = participants[lastQualifiedIndex].score;
		const	firstWithSameScore = participants.findIndex((value) => value.score === lastQualifiedScore);
		const	lastWithSameScore = participants.findLastIndex((value) => value.score === lastQualifiedScore);

		if (lastQualifiedIndex === lastWithSameScore)
		{
			qualified.push(...participants.splice(0, participantsToQualify));
			participants = [];
		}
		else
		{
			qualified.push(...participants.splice(0, firstWithSameScore));
			participants.splice(lastWithSameScore + 1);
		}
	}

	public static getExpectedQualified(participantCount : number)
	{
		let	expectedQualified = 2;

		while (expectedQualified * 2 <= participantCount)
		{
			expectedQualified *= 2;
		}
		return expectedQualified;
	}
}
