import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";

export class CreateMenuGUI extends ScriptComponent {
	private _upImagePath! : string;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
    }
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
