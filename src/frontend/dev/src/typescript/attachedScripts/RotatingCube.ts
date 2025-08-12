import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";

/**
 * Babylon Script Component
 * @class RotatingCube
 */
export class RotatingCube extends ScriptComponent {
	public	rotationSpeed : number = 1.0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RotatingCube") {
        super(transform, scene, properties, alias);
    }

    protected update(): void {
        /* Update render loop function */
		this.transform.addRotation(0, this.rotationSpeed * this.getDeltaSeconds(), 0);
    }
}

SceneManager.RegisterClass("RotatingCube", RotatingCube);
