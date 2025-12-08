import { isPowerOfTwo } from "@shared/utils";

export type Profile = {
	name : string;
	image : string;
}

export class	Match
{
	constructor(
		private _right : Match | Profile,
		private _left : Match | Profile) {
	}
}

export class	FrontendTournament
{
	private	_matchesRoot : Match;

	constructor(private _participants : Profile[])
	{
		if (_participants.length <= 1 || !isPowerOfTwo(_participants.length))
			throw new Error(`Invalid participants count : ${_participants.length}, it should be power of two, greater than one !`);
		this._matchesRoot = this.createMatches(_participants);
		console.log(this._matchesRoot);
	}

	private	createMatches(profiles : Profile[]) : Match
	{
		const	topMatches = this.createMatchesRecursive(profiles);

		if (topMatches.length !== 2)
			throw new Error("Bug in createMatchesRecursive, it should returns an array of two elements !");
		return new Match(topMatches[0], topMatches[1]);
	}

	private createMatchesRecursive(arr : Profile[] | Match[]) : Profile[] | Match[]
	{
		if (arr.length <= 2)
			return arr;
		const	matches : Match[] = [];

		for (let index = 0; index < arr.length / 2; index++) {
			matches.push(new Match(arr[index * 2], arr[index * 2 + 1]))
		}
		return this.createMatchesRecursive(matches);
	}
}
