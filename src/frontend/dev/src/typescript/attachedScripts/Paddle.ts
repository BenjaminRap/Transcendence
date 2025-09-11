import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { InputManager } from "./InputManager";
import { InputKey } from "../InputKey";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { GameManager } from "./GameManager";

export class Paddle extends ScriptComponent {
	private	_speed : number = 6.0;
	private	_inputManagerTransform! : IUnityTransform;
	private	_gameManagerTransform! : IUnityTransform;
	private	_upKeyStringCode : string = "z";
	private	_downKeyStringCode : string = "s";

	private	_physicsBody! : PhysicsBody;
	private	_upKeyInfo! : InputKey;
	private	_downKeyInfo! : InputKey;
	private _movementRange : number = 8;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Paddle") {
        super(transform, scene, properties, alias);
		globalThis.HKP!.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
    }

	private onTriggerEnter(collision : IBasePhysicsCollisionEvent)
	{

		if (collision.type !== PhysicsEventType.TRIGGER_ENTERED
			|| collision.collider !== this._physicsBody)
			return ;
		const	collidedAgainst = collision.collidedAgainst;

		const	newDirection = this.getNewDirection(collidedAgainst);
		const	newSpeed = this.getNewSpeed(collidedAgainst);
		const	newVelocity = newDirection.scale(newSpeed);

		collidedAgainst.setLinearVelocity(newVelocity);
	}

	private getNewDirection(collidedAgainst : PhysicsBody) : Vector3
	{
		const	collidedPosInWorld = collidedAgainst.transformNode.absolutePosition;
		const	collidedPosInPaddleLocal = Vector3.TransformCoordinates(collidedPosInWorld, this.transform.getWorldMatrix().invert());
		const	maxAngle = Math.PI / 4;
		const	prct = collidedPosInPaddleLocal.y * 2;
		const	angle = maxAngle * prct;
		const	rotation = Quaternion.RotationAxis(Vector3.LeftHandedForwardReadOnly, angle);
		const	direction = this.transform.right.applyRotationQuaternion(rotation);

		return (direction);
	}

	private getNewSpeed(collidedAgainst : PhysicsBody) : number
	{
		const	newSpeed = collidedAgainst.getLinearVelocity().length();

		return newSpeed;
	}

	protected start()
	{
		const	inputManagerNode = SceneManager.GetTransformNodeByID(this.scene, this._inputManagerTransform.id);
		const	inputManager = SceneManager.GetComponent<InputManager>(inputManagerNode, "InputManager", false);

		this._upKeyInfo = inputManager.getInputKey(this._upKeyStringCode);
		this._downKeyInfo = inputManager.getInputKey(this._downKeyStringCode);
		const	physicsBody = this.getAbstractMesh().getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Paddle script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;

		const	gameManagerNode = SceneManager.GetTransformNodeByID(this.scene, this._gameManagerTransform.id);
		const	gameManager = SceneManager.GetComponent<GameManager>(gameManagerNode, "GameManager", false);

		this._movementRange = gameManager.getPaddleMovementRange();
	}

	protected update()
	{
		const	isUpPressed : number = this._upKeyInfo.isKeyDown() ? 1 : 0;
		const	isDownPressed : number = this._downKeyInfo.isKeyDown() ? 1 : 0;

		let		speedFactor : number = isUpPressed - isDownPressed;
		if (this.transform.position.y < -this._movementRange / 2 && speedFactor === -1)
			speedFactor = 0;
		else if (this.transform.position.y > this._movementRange / 2 && speedFactor === 1)
			speedFactor = 0;
		const	velocityLength : number = speedFactor * this._speed;

		this._physicsBody.setLinearVelocity(Vector3.Up().scale(velocityLength));
	}
}

SceneManager.RegisterClass("Paddle", Paddle);
