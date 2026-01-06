import { HavokPlugin, type int } from "@babylonjs/core";
import { PongGame } from "./PongGame";
import { type FrontendGameType, SceneData } from "@shared/SceneData";
import { ServerProxy } from "./ServerProxy";
import { FrontendEventsManager } from "./FrontendEventsManager";
import type { LocalTournament } from "./LocalTournament";

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
		public readonly tournament? : LocalTournament
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
		this._events.dispose();
	}
}
