import type { EndData } from "./attachedScripts/GameManager";
import { PongError } from "./pongError/PongError";
import type { ProfileWithScore } from "./TournamentHelper";

export class	Match<T>
{
	private _winner? : ProfileWithScore<T> | null;
	private _winnerSide? : "left" | "right" | "draw";

	constructor(
		private _left : Match<T> | ProfileWithScore<T>,
		private _right : Match<T> | ProfileWithScore<T>) {
	}

	public setWinner(endData : EndData)
	{
		if (this._winner !== undefined)
			return ;
		this._winnerSide = endData.winner;
		if (endData.winner === "draw")
		{
			this._winner = null;
			return ;
		}
		const	winnerOrMatch = (endData.winner === "left") ? this._left : this._right;

		if (winnerOrMatch instanceof Match)
		{
			const	winnerProfile = winnerOrMatch.winner;

			if (winnerProfile === undefined)
				throw new PongError("setting the winner of a match while the child matches aren't finished !", "quitPong")
			this._winner = winnerProfile;
		}
		else
			this._winner = winnerOrMatch;
		if (this._winner !== null)
			this._winner.score += 1;
	}

	public get winner()
	{
		return this._winner;
	}

	public get winnerSide()
	{
		return this._winnerSide;
	}

	public get right()
	{
		if (this._right instanceof Match)
			return this._right.winner
		return this._right;
	}

	public get left()
	{
		if (this._left instanceof Match)
			return this._left.winner
		return this._left;
	}

	public get losers()
	{
		const	losers = [];
		const	left = this.left;
		const	right = this.right;

		if (right && this._winner !== right)
			losers.push(right);
		if (left && this._winner !== left)
			losers.push(left);
		return losers;
	}
}

