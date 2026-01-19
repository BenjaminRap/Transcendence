import { Observable } from "@babylonjs/core/Misc/observable";
import { EventsManager } from "@shared/EventsManager";
import type { Profile } from "@shared/Profile";
import type { ClientInput } from "./FrontendSceneData";
import type { GameInfos, TournamentEvent } from "@shared/ServerMessage";
import type { MatchWinningDescription } from "./gui/TournamentGUI";

export class	FrontendEventsManager extends EventsManager
{
	private _allEvents;

	constructor()
	{
		super();
		const additionalEvents = {
			"input-change": new Observable<ClientInput[]>,
			"enemy-type-change" : new Observable<[string, string]>,
			"scene-change" : new Observable<[string, string]>,
			"set-participants" : new Observable<[Profile, Profile]>,
			"tournament-event": new Observable<TournamentEvent>,
			"game-infos": new Observable<GameInfos>,
			"tournament-gui-create": new Observable<Profile[]>,
			"tournament-gui-set-winners": new Observable<[number, MatchWinningDescription[]]>,
			"show-tournament": new Observable<void>,
		};
		this._allEvents = { ...this._events, ...additionalEvents }
	}

	public getObservable<T extends (keyof typeof this._allEvents)>(event : T) : (typeof this._allEvents)[T]
	{
		return this._allEvents[event];
	}

	public dispose() : void
	{
		Object.values(this._allEvents).forEach((observable) => {
			observable.clear();
		})
	}
}
