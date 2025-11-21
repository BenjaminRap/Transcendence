import { LocalMessageBus } from "@babylonjs-toolkit/next";
import { HavokPlugin } from "@babylonjs/core";

export class	SceneData
{
	public readonly messageBus = new LocalMessageBus();
	constructor(
		public readonly havokPlugin : HavokPlugin
	) {

	}

	public dispose()
	{
		this.messageBus.Dispose();
	}
}
