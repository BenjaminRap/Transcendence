import { EventsManager } from "../../../shared/EventsManager.js";
export class ServerEventsManager extends EventsManager {
    constructor() {
        super();
        const additionalEvents = {};
        this._allEvents = { ...this._events, ...additionalEvents };
    }
    getObservable(event) {
        return this._allEvents[event];
    }
    dispose() {
        Object.values(this._allEvents).forEach((observable) => {
            observable.clear();
        });
    }
}
