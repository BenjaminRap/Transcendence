import { HavokPlugin } from "@babylonjs/core";
import { PongGame } from ".";
import { SceneData } from "@shared/SceneData";

export class FrontendSceneData extends SceneData
{
	constructor(
		havokPlugin : HavokPlugin,
		public readonly pongHTMLElement : PongGame
	) {
		super(havokPlugin);
	}
}
