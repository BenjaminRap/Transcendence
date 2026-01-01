import type { Profile } from "./Profile";

export class	Match
{
	private _winner? : Profile;
	private _winnerSide? : "left" | "right";

	constructor(
		private _left : Match | Profile,
		private _right : Match | Profile) {
	}

	public setWinner(side : "left" | "right")
	{
		if (this._winner !== undefined)
			return ;
		this._winnerSide = side;
		const	winner = (side === "left") ? this._left : this._right;

		if (winner instanceof Match)
			this._winner = winner.getWinner();
		else
			this._winner = winner;
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

