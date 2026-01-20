import { Observable } from "@babylonjs/core";
export class EventsManager {
    constructor() {
        this._events = {
            "updateRightScore": new Observable,
            "updateLeftScore": new Observable,
            "end": new Observable,
            "game-start": new Observable,
            "forfeit": new Observable,
            "game-paused": new Observable,
            "game-unpaused": new Observable,
        };
    }
    getObservable(event) {
        return this._events[event];
    }
}
