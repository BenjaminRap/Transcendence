import { Deferred, HavokPlugin, Scene } from "@babylonjs/core";
import { EventsManager } from "./EventsManager";
import { PongError } from "./pongError/PongError";

export type ServerGameType = "Server";
export type FrontendGameType = "Local" | "Multiplayer" | "Bot" | "Menu";
export type GameType = ServerGameType | FrontendGameType;

export abstract class	SceneData
{
	public readonly readyPromise;

	constructor(
		public readonly havokPlugin : HavokPlugin,
		public readonly gameType : GameType,
		protected readonly _events : EventsManager
	) {
		this.readyPromise = new Deferred<void>
	}

	public get events()
	{
		return this._events;
	}

	public abstract dispose() : void;
}

export function	getSceneData(scene : Scene) : SceneData
{
	if (!scene.metadata)
		throw new PongError("Scene metadata is undefined !", "quitScene");

	const	sceneData = scene.metadata.sceneData;
	if (!(sceneData instanceof SceneData))
		throw new PongError("Scene is not of the type SceneData !", "quitScene");
	return sceneData;
}
