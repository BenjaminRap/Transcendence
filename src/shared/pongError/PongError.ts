export type PongErrorSeverity = "ignore" | "quitScene" | "quitPong";

export class	PongError extends Error
{
	constructor(
		message : string,
		private _severity : PongErrorSeverity)
	{
		super(message);
		this.name = new.target.name;
	}

	public getSeverity()
	{
		return this._severity;
	}
}
