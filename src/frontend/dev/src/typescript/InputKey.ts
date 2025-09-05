export class	InputKey
{
	private _isDown: boolean = false;

	private _onKeyDownObservers : (() => void)[] = [];

	public setKeyDown() : void
	{
		if (this._isDown)
			return ;
		this._isDown = true;
		this._onKeyDownObservers.forEach((callback) => { callback() });
	}

	public setKeyUp() : void
	{
		this._isDown = false;
	}

	public isKeyDown() : boolean
	{
		return (this._isDown);
	}

	public addOnKeyDownObserver(callback : () => void)
	{
		if (this._onKeyDownObservers.indexOf(callback) !== -1)
			throw new Error("onKeyDownObserver already added to the list !");
		this._onKeyDownObservers.push(callback);
	}

	public removeOnKeyDownObserver(callback : () => void)
	{
		const	index = this._onKeyDownObservers.indexOf(callback);

		if (index === -1)
			throw new Error("onKeyDownObserver not added to the list !");
		this._onKeyDownObservers.splice(index, 1);
	}
}
