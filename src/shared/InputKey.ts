export class	InputKey
{
	private _isDown: boolean = false;

	private _keyObserver : ((event : "keyDown" | "keyUp") => void)[] = [];

	public setKeyDown() : void
	{
		if (this._isDown)
			return ;
		this._isDown = true;
		this._keyObserver.forEach((callback) => { callback("keyDown") });
	}

	public setKeyUp() : void
	{
		if (!this._isDown)
			return ;
		this._isDown = false;
		this._keyObserver.forEach((callback) => { callback("keyUp") });
	}

	public isKeyDown() : boolean
	{
		return (this._isDown);
	}

	public addKeyObserver(callback : (event : "keyDown" | "keyUp") => void)
	{
		if (this._keyObserver.indexOf(callback) !== -1)
			throw new Error("onKeyDownObserver already added to the list !");
		this._keyObserver.push(callback);
	}
}
