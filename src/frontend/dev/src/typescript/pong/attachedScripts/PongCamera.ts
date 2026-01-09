import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { PongError } from "@shared/pongError/PongError";

export class PongCamera extends CustomScriptComponent {
	private _camera : Camera;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "PongCamera") {
        super(transform, scene, properties, alias);

		if (this.getCameraRig() === null)
			throw new PongError("PongCamera script not attached to a camera !", "quitScene");
		this._camera = this.getCameraRig();
    }

    protected awake(): void {
		this._camera.layerMask = 1;
    }
}

SceneManager.RegisterClass("PongCamera", PongCamera);
