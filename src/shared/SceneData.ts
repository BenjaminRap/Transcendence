import { Deferred, HavokPlugin, Scene } from "@babylonjs/core";
import { EventsManager } from "./EventsManager";

export type ServerGameType = "Server";
export type FrontendGameType = "Local" | "Multiplayer" | "Bot" | "Menu";
export type GameType = ServerGameType | FrontendGameType;

export class	SceneData
{
	public readonly events = new EventsManager();
	public readonly readyPromise;

	constructor(
		public readonly havokPlugin : HavokPlugin,
		public readonly gameType : GameType,
	) {
		this.readyPromise = new Deferred<void>
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
