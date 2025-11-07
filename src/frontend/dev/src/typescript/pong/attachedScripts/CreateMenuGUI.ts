import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI } from "../MenuGUI";

export class CreateMenuGUI extends ScriptComponent {
	private _upImagePath! : string;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	sceneData = this.scene.metadata.sceneData;

		if (!(sceneData instanceof FrontendSceneData))
			throw new Error("The scene.metadata should have a sceneData variable of type FrontendSceneData !");
		const	pongHTMLElement = sceneData.pongHTMLElement;

		const	menuGUI = new MenuGUI();

		menuGUI.setAttribute("button-image-url", this._upImagePath);
		pongHTMLElement.appendChild(menuGUI);
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
