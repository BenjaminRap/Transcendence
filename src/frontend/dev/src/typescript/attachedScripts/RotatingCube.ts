import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
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
		const	speedFactor = 2;
		const	yOffset : number = Math.sin(this.getGameTime() * speedFactor) * maximunOffsetLength;
		const	offset = new Vector3(0, yOffset, 0);

		this.transform.position = this._initialPosition.add(offset);
	}
}

SceneManager.RegisterClass("RotatingCube", RotatingCube);
