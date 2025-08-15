import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class RotatingCube extends ScriptComponent {
	public	rotationSpeed : number = 1.0;
	private _initialPosition : Vector3;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RotatingCube") {
        super(transform, scene, properties, alias);
		this._initialPosition = transform.position;
    }

    protected update(): void {
		this.transform.addRotation(0, this.rotationSpeed * this.getDeltaSeconds(), 0);
		this.moveUpAndDown();
    }

	private moveUpAndDown() : void {
		const	maximunOffsetLength : number = 1;
		const	speed = 0.002;
		const	yOffset : number = Math.sin(Tools.Now * speed) * maximunOffsetLength;
		const	offset = new Vector3(0, yOffset, 0);

		this.transform.position = this._initialPosition.add(offset);
	}
}

SceneManager.RegisterClass("RotatingCube", RotatingCube);
