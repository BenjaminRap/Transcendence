import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { InputManager } from "./InputManager";
import { InputKey } from "../InputKey";

export class Paddle extends ScriptComponent {
	public speed : number = 3.0;
	public inputManagerTransform : IUnityTransform | undefined;

	private _physicsBody : PhysicsBody | undefined;
	private _upKey : InputKey | undefined;
	private _downKey : InputKey | undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Paddle") {
        super(transform, scene, properties, alias);
    }

	protected start()
	{
		if (!this.inputManagerTransform?.id)
			throw new Error("Invalid InputManager transform id !");
		const	inputManagerNode = SceneManager.GetTransformNodeByID(this.scene, this.inputManagerTransform.id);
		const	inputManager = SceneManager.GetComponent<InputManager>(inputManagerNode, "InputManager", false);

		this._upKey = inputManager.getInputKey("KeyW");
		this._downKey = inputManager.getInputKey("KeyS");
		const	physicsBody = this.getAbstractMesh().getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
	}

	protected update()
	{
		const	isUpPressed : number = this._upKey!.isKeyDown() ? 1 : 0;
		const	isDownPressed : number = this._downKey!.isKeyDown() ? 1 : 0;
		const	direction : number = isUpPressed - isDownPressed;

		this._physicsBody?.setLinearVelocity(Vector3.Up().scale(direction * this.speed));
	}
}

SceneManager.RegisterClass("Paddle", Paddle);
