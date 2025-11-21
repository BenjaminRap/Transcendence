import { HavokPlugin, int } from "@babylonjs/core";
import { GameType, PongGame } from ".";
import { SceneData } from "@shared/SceneData";
import { ServerCommunicationHandler } from "./ServerCommunicationHandler";

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
		public readonly gameType : GameType,
		public readonly inputs : readonly ClientInput[],
		public readonly serverCommunicationHandler? : ServerCommunicationHandler
	) {
		super(havokPlugin);
	}
}
