export abstract class	UniqueDelayOwner
{
	private _timeout : ReturnType<typeof setTimeout> | null = null;

	protected async delay(callback: () => void, durationMs : number)
	{
		this.clearDelay();
		this._timeout = setTimeout(() => {
			callback();
			this._timeout = null;
		}, durationMs);
	}

	protected	clearDelay()
	{
		if (!this._timeout)
			return ;
		clearTimeout(this._timeout);
		this._timeout = null;
	}
}
