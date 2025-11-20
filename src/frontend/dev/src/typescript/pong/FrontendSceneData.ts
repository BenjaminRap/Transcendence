import { HavokPlugin } from "@babylonjs/core";
import { GameType, PongGame } from ".";
import { SceneData } from "@shared/SceneData";

export class FrontendSceneData extends SceneData
{
	constructor(
		havokPlugin : HavokPlugin,
		public readonly pongHTMLElement : PongGame,
		public readonly gameType : GameType
	) {
		super(havokPlugin);
	}
}
