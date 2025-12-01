import { HavokPlugin, type int } from "@babylonjs/core";
import { PongGame } from "./PongGame";
import { type FrontendGameType, SceneData } from "@shared/SceneData";
import { ServerProxy } from "./ServerProxy";

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
		public readonly serverProxy? : ServerProxy
	) {
		super(havokPlugin, gameType);
	}
}
