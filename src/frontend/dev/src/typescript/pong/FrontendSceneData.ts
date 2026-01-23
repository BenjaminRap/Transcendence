import { HavokPlugin, type int } from "@babylonjs/core";
import { PongGame } from "./PongGame";
import { type FrontendGameType, type FrontendSceneName, SceneData } from "@shared/SceneData";
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
		sceneName : FrontendSceneName,
		havokPlugin : HavokPlugin,
		public readonly pongHTMLElement : PongGame,
		public readonly gameType : FrontendGameType,
		public readonly serverProxy : ServerProxy,
		public readonly tournament? : LocalTournament
	) {
		super(sceneName, havokPlugin, gameType, new FrontendEventsManager());
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
