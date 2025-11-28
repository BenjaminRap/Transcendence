import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { getFrontendSceneData } from "../PongGame";

export class Bot extends ScriptComponent {
    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Bot") {
        super(transform, scene, properties, alias);

		const	sceneData = getFrontendSceneData(this.scene);

		if (sceneData.gameType !== "Bot")
			SceneManager.DestroyScriptComponent(this);
    }

	protected	awake()
	{
		console.log("bot !");
	}
}

SceneManager.RegisterClass("Bot", Bot);
