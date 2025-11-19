import { HavokPlugin } from "@babylonjs/core";
import { DefaultSocket } from ".";
import { SceneData } from "@shared/SceneData";

export class	ServerSceneData extends SceneData
{
	constructor(
		havokPlugin : HavokPlugin,
		public readonly firstSocket : DefaultSocket,
		public readonly secondSocket : DefaultSocket

	) {
		super(havokPlugin);
	}
}
