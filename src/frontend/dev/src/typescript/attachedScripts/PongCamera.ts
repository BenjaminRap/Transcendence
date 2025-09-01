import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Camera } from "@babylonjs/core/Cameras/camera";

export class PongCamera extends ScriptComponent {
	private _camera : Camera;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "PongCamera") {
        super(transform, scene, properties, alias);

		if (this.getCameraRig() === null)
			throw new Error("PongCamera script not attached to a camera !");
		this._camera = this.getCameraRig();
    }

    protected awake(): void {
		this._camera.layerMask = 1;
    }
}

SceneManager.RegisterClass("PongCamera", PongCamera);
