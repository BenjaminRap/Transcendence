import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { GameManager } from "./GameManager";
import type { int } from "@babylonjs/core/types";
import { Imported } from "@shared/ImportedDecorator";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export interface	Timer
{
	callback: () => void,
	delayMs: number,
	remainingTime : number,
	remainingCall : int
}

export class TimerManager extends CustomScriptComponent {
	@Imported("GameManager") private _gameManager! : GameManager;

	private _timers : Map<number, Timer>;
	private _nextId : number = 0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "TimerManager") {
        super(transform, scene, properties, alias);
		this._timers = new Map<number, Timer>();
    }

	protected	update()
	{
		if (this._gameManager.isGamePaused())
			return ;
		this._timers.forEach((timer : Timer, key : number) => {
			timer.remainingTime -= this.getDeltaMilliseconds();
			if (timer.remainingTime > 0)
				return ;
			timer.callback();
			timer.remainingCall--;
			timer.remainingTime = timer.delayMs;
			if (timer.remainingCall <= 0)
				this._timers.delete(key);
		});
	}

	public setTimer(callback: () => void, delayMs : number, remainingCall : int) : number
	{
		const	timer : Timer = {
			callback: callback,
			delayMs: delayMs,
			remainingTime: delayMs,
			remainingCall: remainingCall
		};
		this._timers.set(this._nextId, timer);
		this._nextId++;
		return (this._nextId - 1);
	}

	public setTimeout(callback: () => void, delayMs : number)
	{
		return this.setTimer(callback, delayMs, 1);
	}

	public setInterval(callback: () => void, delayMs : number)
	{
		return this.setTimer(callback, delayMs, Infinity);
	}

	public clearTimer(timer : number)
	{
		this._timers.delete(timer);
	}
}

SceneManager.RegisterClass("TimerManager", TimerManager);
