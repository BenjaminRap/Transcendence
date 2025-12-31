import { EventsManager } from "@shared/EventsManager";

export class ServerEventsManager extends EventsManager
{
	private _allEvents;

	constructor()
	{
		super();
		const additionalEvents = {
		};
		this._allEvents = { ...this._events, ...additionalEvents }
	}

	public getObservable<T extends (keyof typeof this._allEvents)>(event : T) : (typeof this._allEvents)[T]
	{
		return this._allEvents[event];
	}
}
