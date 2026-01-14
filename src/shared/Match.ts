import type { EndData } from "./attachedScripts/GameManager";
import { PongError } from "./pongError/PongError";
import type { ProfileWithScore } from "./TournamentHelper";

export class	Match
{
	private _winner? : ProfileWithScore;
	private _winnerSide? : "left" | "right";

	constructor(
		private _left : Match | ProfileWithScore,
		private _right : Match | ProfileWithScore) {
	}

	public setWinner(endData : EndData)
	{
		if (this._winner !== undefined)
			return ;
		if (endData.winner === "draw")
			throw new PongError("A game can't be a draw in a tournament !", "quitPong");
		this._winnerSide = endData.winner;
		const	winner = (endData.winner === "left") ? this._left : this._right;

		if (winner instanceof Match)
		{
			const	winnerProfile = winner.getWinner();

			if (!winnerProfile)
				throw new PongError("setting the winner of a match while the child matches aren't finished !", "quitPong")
			this._winner = winnerProfile;
		}
		else
			this._winner = winner;
		this._winner.score += 1;
	}

	public getWinner()
	{
		return this._winner;
	}

	public getWinnerSide()
	{
		return this._winnerSide;
	}

	public getRight()
	{
		if (this._right instanceof Match)
			return this._right.getWinner()
		return this._right;
	}

	public getLeft()
	{
		if (this._left instanceof Match)
			return this._left.getWinner();
		return this._left;
	}
}

