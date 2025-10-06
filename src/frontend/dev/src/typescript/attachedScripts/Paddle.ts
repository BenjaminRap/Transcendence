import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { InputManager } from "./InputManager";
import { InputKey } from "../InputKey";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { GameManager } from "./GameManager";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";

export class Paddle extends ScriptComponent {
	private	_speed : number = 6.0;
	private	_inputManagerTransform! : TransformNode;
	private	_gameManagerTransform! : TransformNode;
	private	_upKeyStringCode : string = "z";
	private	_downKeyStringCode : string = "s";
	private _minReboundSpeed : number = 10;
	private _maxReboundSpeed : number = 15;

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
		const	previousSpeed = collidedAgainst.getLinearVelocity().length();
		const	newSpeed = Scalar.Clamp(previousSpeed * 1.05, this._minReboundSpeed, this._maxReboundSpeed);

		return newSpeed;
	}

	protected start()
	{
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManagerTransform, "InputManager", false);

		this._upKeyInfo = inputManager.getInputKey(this._upKeyStringCode);
		this._downKeyInfo = inputManager.getInputKey(this._downKeyStringCode);
		const	physicsBody = this.getAbstractMesh().getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Paddle script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;

		const	gameManager = SceneManager.GetComponent<GameManager>(this._gameManagerTransform, "GameManager", false);

		this._movementRange = gameManager.getPaddleMovementRange();
	}

	protected update()
	{
		const	isUpPressed : boolean = this._upKeyInfo.isKeyDown();
		const	isDownPressed : boolean = this._downKeyInfo.isKeyDown();
		const	canMoveUp : boolean = this.transform.position.y + this.transform.scaling.y / 2 < this._movementRange / 2;
		const	canMoveDown : boolean = this.transform.position.y - this.transform.scaling.y / 2 > -this._movementRange / 2;
		let		yVelocity : number = 0;

		if (isUpPressed && !isDownPressed && canMoveUp)
			yVelocity = 1;
		else if (isDownPressed && !isUpPressed && canMoveDown)
			yVelocity = -1;

		this._physicsBody.setLinearVelocity(Vector3.Up().scale(yVelocity * this._speed));
	}
}

SceneManager.RegisterClass("Paddle", Paddle);
