import type { EndData } from "./attachedScripts/GameManager";
import { PongError } from "./pongError/PongError";
import type { ProfileWithScore } from "./TournamentHelper";

export class	Match<T>
{
	private _winner? : ProfileWithScore<T>;
	private _winnerSide? : "left" | "right";

	constructor(
		private _left : Match<T> | ProfileWithScore<T>,
		private _right : Match<T> | ProfileWithScore<T>) {
	}

	public setWinner(endData : EndData)
	{
		if (this._winner !== undefined)
			return ;
		if (endData.winner === "draw")
			throw new PongError("A game can't be a draw in a tournament !", "quitPong");
		this._winnerSide = endData.winner;
		const	winnerOrMatch = (endData.winner === "left") ? this._left : this._right;

		if (winnerOrMatch instanceof Match)
		{
			const	winnerProfile = winnerOrMatch.winner;

			if (!winnerProfile)
				throw new PongError("setting the winner of a match while the child matches aren't finished !", "quitPong")
			this._winner = winnerProfile;
		}
		else
			this._winner = winnerOrMatch;
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

	public get loser()
	{
		const	left = this.left;
		const	right = this.right;

		if (this._winner === left)
			return right;
		if (this._winner === right)
			return left;
		return undefined;
	}
}

