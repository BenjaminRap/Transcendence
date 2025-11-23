import { HavokPlugin } from "@babylonjs/core";
import { SceneData } from "@shared/SceneData";
import { ClientProxy } from "./ClientProxy";

export class	ServerSceneData extends SceneData
{
	constructor(
		havokPlugin : HavokPlugin,
		public readonly clientProxy : ClientProxy

	) {
		super(havokPlugin, "Server");
	}
}
