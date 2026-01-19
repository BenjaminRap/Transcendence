import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { PongError } from "@shared/pongError/PongError";

export class BackgroundCamera extends CustomScriptComponent {
	private _camera : Camera;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "BackgroundCamera") {
        super(transform, scene, properties, alias);

		this._camera = this.getCameraRig();
		if (this._camera === null)
			throw new PongError("BackgroundCamera script not attached to a camera !", "quitScene");
    }

    protected awake(): void {
		this._camera.layerMask = 2;
    }
}

SceneManager.RegisterClass("BackgroundCamera", BackgroundCamera);
