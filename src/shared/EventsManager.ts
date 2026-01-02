import { type int, Observable } from "@babylonjs/core";
import type { EndData } from "./attachedScripts/GameManager";
import type { Profile } from "./Profile";

export abstract class	EventsManager
{
	protected _events;

	constructor()
	{
		this._events = {
			"updateRightScore": new Observable<int>,
			"updateLeftScore": new Observable<int>,
			"end": new Observable<EndData>,
			"game-start": new Observable<void>,
			"forfeit": new Observable<"left" | "right" | "highestScore">,
			"game-paused" : new Observable<void>,
			"game-unpaused": new Observable<void>,
			"tournament-end" : new Observable<Profile>,
		}
	}

	public getObservable<T extends (keyof typeof this._events)>(event : T) : (typeof this._events)[T]
	{
		return this._events[event];
	}

	public abstract	dispose() : void;
}
