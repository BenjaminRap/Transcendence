import { HavokPlugin, type int } from "@babylonjs/core";
import { PongGame } from "./PongGame";
import { type FrontendGameType, SceneData } from "@shared/SceneData";
import { ServerProxy } from "./ServerProxy";
import type { Tournament } from "@shared/Tournament";
import { FrontendEventsManager } from "./FrontendEventsManager";

export interface	ClientInput
{
	index : int;
	upKey : string;
	downKey : string;
}

export class FrontendSceneData extends SceneData
{
	constructor(
		havokPlugin : HavokPlugin,
		public readonly pongHTMLElement : PongGame,
		public readonly gameType : FrontendGameType,
		public inputs : readonly ClientInput[],
		public readonly serverProxy? : ServerProxy,
		public readonly tournament? : Tournament
	) {
		super(havokPlugin, gameType, new FrontendEventsManager());
	}

	public get events()
	{
		return this._events as FrontendEventsManager;
	}

	public dispose()
	{
		this.tournament?.dispose();
	}
}
