import { HavokPlugin } from "@babylonjs/core";
import { SceneData } from "@shared/SceneData";
import { ClientProxy } from "./ClientProxy";
import { ServerEventsManager } from "./ServerEventsManager";

export class	ServerSceneData extends SceneData
{
	constructor(
		havokPlugin : HavokPlugin,
		public readonly clientProxy : ClientProxy

	) {
		super(havokPlugin, "Server", new ServerEventsManager());
	}

	public get events()
	{
		return this._events as ServerEventsManager;
	}

	public dispose()
	{
	}
}
