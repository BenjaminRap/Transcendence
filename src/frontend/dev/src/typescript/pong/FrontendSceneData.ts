import { HavokPlugin, type int } from "@babylonjs/core";
import { PongGame } from "./PongGame";
import { type FrontendGameSceneName, type FrontendMenuSceneName, SceneData } from "@shared/SceneData";
import { ServerProxy } from "./ServerProxy";
import { FrontendEventsManager } from "./FrontendEventsManager";
import type { LocalTournament } from "./LocalTournament";
import type { BotDifficulty } from "./BotDiificulties";

export interface	ClientInput
{
	index : int;
	upKey : string;
	downKey : string;
}

export type FrontendSceneProperties = {
	gameType: "Local",
	tournament? : LocalTournament
	sceneName : FrontendGameSceneName
} | {
	gameType: "Bot"
	difficulty: keyof BotDifficulty
	sceneName : FrontendGameSceneName
} | {
	gameType: "Menu"
	sceneName : FrontendMenuSceneName
} | {
	gameType: "Multiplayer"
	sceneName : FrontendGameSceneName
};

export class FrontendSceneData extends SceneData
{
	public readonly tournament? : LocalTournament;
	public readonly difficulty?: keyof BotDifficulty;

	constructor(
		havokPlugin : HavokPlugin,
		properties : FrontendSceneProperties,
		public readonly pongHTMLElement : PongGame,
		public readonly serverProxy : ServerProxy,
	) {
		super(properties.sceneName, havokPlugin, properties.gameType, new FrontendEventsManager());
		if (properties.gameType === "Local")
			this.tournament = properties.tournament;
		else if (properties.gameType === "Bot")
			this.difficulty = properties.difficulty;
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
