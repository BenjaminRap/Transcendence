import { Observable } from "@babylonjs/core/Misc/observable";
import { EventsManager } from "@shared/EventsManager";
import type { Profile } from "@shared/Profile";

export class	FrontendEventsManager extends EventsManager
{
	private _allEvents;

	constructor()
	{
		super();
		const additionalEvents = {
			"show-tournament": new Observable<HTMLElement>,
			"input-change": new Observable<void>,
			"enemy-type-change" : new Observable<[string, string]>,
			"scene-change" : new Observable<[string, string]>,
			"set-participants" : new Observable<[Profile, Profile]>,
		};
		this._allEvents = { ...this._events, ...additionalEvents }
	}

	public getObservable<T extends (keyof typeof this._allEvents)>(event : T) : (typeof this._allEvents)[T]
	{
		return this._allEvents[event];
	}
}
