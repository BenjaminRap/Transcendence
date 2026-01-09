import { PongError } from "./pongError/PongError";

export type InputKeyCallback = (event : "keyUp" | "keyDown") => void;

export class	InputKey
{
	private _isDown: boolean = false;

	private _keyObserver : InputKeyCallback[] = [];

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

	public addKeyObserver(callback : InputKeyCallback)
	{
		if (this._keyObserver.indexOf(callback) !== -1)
			throw new PongError("onKeyDownObserver already added to the list !", "ignore");
		this._keyObserver.push(callback);
	}

	public removeKeyObserver(callback : InputKeyCallback)
	{
		const	index = this._keyObserver.indexOf(callback);

		if (index === -1)
			return ;
		this._keyObserver.splice(index, 1);
	}
}
