import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PauseGUI } from "../pauseGUI";
import { FrontendSceneData } from "../FrontendSceneData";

export class CreatePauseGUI extends ScriptComponent {
	private _type : "basic" | "colorful" = "basic";

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreatePauseGUI") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	sceneData = this.scene.metadata.sceneData;

		if (!(sceneData instanceof FrontendSceneData))
			throw new Error("The scene.metadata should have a sceneData variable of type FrontendSceneData !");
		const	pongHTMLElement = sceneData.pongHTMLElement;
		const	pauseGUI = new PauseGUI(this._type);

		pongHTMLElement.appendChild(pauseGUI);
	}
}

SceneManager.RegisterClass("CreatePauseGUI", CreatePauseGUI);
