import { Tournament} from "@shared/Tournament";
import type { EventsManager } from "@shared/EventsManager";
import type { Profile } from "@shared/Profile";

export class	FrontendTournament extends Tournament
{
	constructor(private _participants : Profile[], private _eventManager : EventsManager)
	{
		super();
	}

	public start()
	{
	}
}
