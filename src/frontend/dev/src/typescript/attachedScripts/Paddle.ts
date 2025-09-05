import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { InputManager } from "./InputManager";
import { InputKey } from "../InputKey";

export class Paddle extends ScriptComponent {
	private	_speed : number = 6.0;
	private	_inputManagerTransform : IUnityTransform | undefined;
	private	_upKeyStringCode : string = "z";
	private	_downKeyStringCode : string = "s";
	private	_physicsBody : PhysicsBody | undefined;
	private	_upKeyInfo : InputKey | undefined;
	private	_downKeyInfo : InputKey | undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Paddle") {
        super(transform, scene, properties, alias);
    }

	protected start()
	{
		if (!this._inputManagerTransform?.id)
			throw new Error("Invalid InputManager transform id !");
		const	inputManagerNode = SceneManager.GetTransformNodeByID(this.scene, this._inputManagerTransform.id);
		const	inputManager = SceneManager.GetComponent<InputManager>(inputManagerNode, "InputManager", false);

		this._upKeyInfo = inputManager.getInputKey(this._upKeyStringCode);
		this._downKeyInfo = inputManager.getInputKey(this._downKeyStringCode);
		const	physicsBody = this.getAbstractMesh().getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
	}

	protected update()
	{
		const	isUpPressed : number = this._upKeyInfo!.isKeyDown() ? 1 : 0;
		const	isDownPressed : number = this._downKeyInfo!.isKeyDown() ? 1 : 0;
		const	direction : number = isUpPressed - isDownPressed;

		this._physicsBody?.setLinearVelocity(Vector3.Up().scale(direction * this._speed));
	}
}

SceneManager.RegisterClass("Paddle", Paddle);
