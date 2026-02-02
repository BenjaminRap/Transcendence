const	severities = [ "ignore", "show", "quitScene", "quitPong" ] as const;
export type PongErrorSeverity = (typeof severities)[number];

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

	public setMinimalSeverity(minimalSeverity : PongErrorSeverity)
	{
		const	currentSeverityIndex = severities.findIndex((value) => value === this._severity);
		const	minimalSeverityIndex = severities.findIndex((value) => value === minimalSeverity);

		if (currentSeverityIndex < minimalSeverityIndex)
			this._severity = severities[minimalSeverityIndex];
	}
}

export function	setMinimalSeverity(error : any, minimalSeverity : PongErrorSeverity)
{
	if (error instanceof PongError)
		error.setMinimalSeverity(minimalSeverity);
	return error
}
