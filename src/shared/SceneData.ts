import { LocalMessageBus } from "@babylonjs-toolkit/next";
import { HavokPlugin, Scene } from "@babylonjs/core";

export type ServerGameType = "Server";
export type FrontendGameType = "Local" | "Multiplayer" | "Bot" | "Menu";
export type GameType = ServerGameType | FrontendGameType;

export class	SceneData
{
	public readonly messageBus = new LocalMessageBus();
	constructor(
		public readonly havokPlugin : HavokPlugin,
		public readonly gameType : GameType,
	) {

	}

	public dispose()
	{
		this.messageBus.Dispose();
	}
}

export function	getSceneData(scene : Scene) : SceneData
{
	if (!scene.metadata)
		throw new Error("Scene metadata is undefined !");

	const	sceneData = scene.metadata.sceneData;
	if (!(sceneData instanceof SceneData))
		throw new Error("Scene is not of the type SceneData !");
	return sceneData;
}
