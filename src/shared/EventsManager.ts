import { int, Observable } from "@babylonjs/core";
import { EndData } from "./attachedScripts/GameManager";

export class	EventsManager
{
	private _events;

	constructor()
	{
		this._events = {
			"updateRightScore": new Observable<int>,
			"updateLeftScore": new Observable<int>,
			"end": new Observable<EndData>,
			"game-start": new Observable<void>,
			"forfeit": new Observable<"left" | "right" | "highestScore">,
			"input-change": new Observable<void>
		}
	}

	public getObservable<T extends keyof typeof this._events>(event : T) : (typeof this._events)[T]
	{
		return this._events[event];
	}
}
