import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { InputManager, PlayerInput } from "./InputManager";
import { type IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { Clamp, Epsilon } from "@babylonjs/core";
import type { int } from "@babylonjs/core";
import { getSceneData } from "@shared/SceneData";
import { Imported } from "@shared/ImportedDecorator";
import { zodInt } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import type { Ball } from "./Ball";
import { Range } from "../Range"

export class Paddle extends CustomScriptComponent {
	public static _range : number = 9.4 + Epsilon;
	public static _hitAcceleration : number = 1.05;
	public static _ballXSpeedRange = new Range(8, 12);
	public static _ballmaxSpeed = 16;
	public static _speed : number = 9;

	public static _maxAngle : number = Math.PI / 3;

	@Imported("InputManager") private	_inputManager! : InputManager;
	@Imported(zodInt) private _playerIndex! : int;
	@Imported("Ball") private _ball! : Ball;

	private	_physicsBody! : PhysicsBody;
	private _playerInput! : PlayerInput;
	private _initialPosition : Vector3;
	private _canMove : boolean = false;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Paddle") {
        super(transform, scene, properties, alias);

		this._initialPosition = this.transform.position.clone();
		const	sceneData = getSceneData(this.scene);

		sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
		sceneData.events.getObservable("game-start").add(() => {
			this._canMove = true;
			this.reset();
		});
		sceneData.events.getObservable("end").add(() => {
			this._physicsBody.setLinearVelocity(Vector3.ZeroReadOnly);
			this._canMove = false;
		});
    }

	private onTriggerEnter(collision : IBasePhysicsCollisionEvent)
	{
		if (collision.type !== PhysicsEventType.TRIGGER_ENTERED
			|| collision.collider !== this._physicsBody
			|| collision.collidedAgainst.transformNode !== this._ball.transform)
			return ;
		const	currentVelocity = this._ball.getLinearVelocity();
		const	newVelocity = this.getNewVelocity(currentVelocity);

		this._ball.setLinearVelocity(newVelocity);
	}

	public getNewVelocity(currentVelocity : Vector3)
	{

		if (this._ball.isInResetTimeout())
			return this.onBallCollisionY(currentVelocity);
		return this.onBallCollisionX(currentVelocity);
	}

	private	onBallCollisionY(currentVelocity : Vector3)
	{
		const	directionSign = Math.sign(this._ball.transform.absolutePosition.y - this.transform.absolutePosition.y);
		const	newVelocity = currentVelocity.clone();

		newVelocity.y = Paddle._speed * 1.2 * directionSign;

		return newVelocity;
	}

	private	onBallCollisionX(currentVelocity : Vector3)
	{
		this._ball.reverseColliderPenetration(this.transform, "x");

		const	ballAbsolutePosition = this._ball.transform.absolutePosition;
		const	newDirection = this.getNewDirection(ballAbsolutePosition);
		const	newSpeed = this.getNewSpeed(currentVelocity, newDirection);
		const	newVelocity = newDirection.scale(newSpeed);

		return newVelocity;
	}

	public getNewDirection(collidedWorldPos : Vector3) : Vector3
	{
		const	collidedPosInPaddleLocal = Vector3.TransformCoordinates(collidedWorldPos, this.transform.getWorldMatrix().invert());
		if (Math.abs(collidedPosInPaddleLocal.y) < 0.04)
			collidedPosInPaddleLocal.y = 0;
		const	prct = Clamp(collidedPosInPaddleLocal.y * 2, -1, 1);
		const	angle = Paddle._maxAngle * prct;
		const	rotation = Quaternion.RotationAxis(Vector3.LeftHandedForwardReadOnly, angle);
		const	direction = this.transform.right.applyRotationQuaternion(rotation);

		return (direction);
	}

	public getHeightDisplacementForAngle(angle : number) : number
	{
		const	prct = angle / Paddle._maxAngle;
		const	collidePosPaddleLocal = prct / 2;
		const	heightDisplacementWorld = collidePosPaddleLocal * this.transform.absoluteScaling.y;

		return heightDisplacementWorld;
	}

	private getNewSpeed(currentVelocity : Vector3, newDirection : Vector3) : number
	{
		const	newXVelocity = Math.abs(currentVelocity.x) * Paddle._hitAcceleration;
		const	clampedNewXVelocity = Clamp(newXVelocity, Paddle._ballXSpeedRange.min, Paddle._ballXSpeedRange.max);
		const	newSpeed = clampedNewXVelocity / Math.abs(newDirection.x);
		const	clampedNewSpeed = Math.min(newSpeed, Paddle._ballmaxSpeed);

		return clampedNewSpeed;
	}

	protected start()
	{
		this._playerInput = this._inputManager.getPlayerInput(this._playerIndex);
		const	physicsBody = this.transform.getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Paddle script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
		this._physicsBody.disablePreStep = false;
	}

	protected update()
	{
		if (!this._canMove)
			return ;
		const	isUpPressed : boolean = this._playerInput.up.isKeyDown();
		const	isDownPressed : boolean = this._playerInput.down.isKeyDown();
		const	canMoveUp : boolean = this.transform.position.y + this.transform.scaling.y / 2 < Paddle._range / 2;
		const	canMoveDown : boolean = this.transform.position.y - this.transform.scaling.y / 2 > -Paddle._range / 2;
		let		yVelocity : number = 0;

		if (isUpPressed && !isDownPressed && canMoveUp)
			yVelocity = 1;
		else if (isDownPressed && !isUpPressed && canMoveDown)
			yVelocity = -1;

		this._physicsBody.setLinearVelocity(Vector3.Up().scale(yVelocity * Paddle._speed));
	}

	private	reset()
	{
		this.transform.position.copyFrom(this._initialPosition);
		this._physicsBody.setLinearVelocity(Vector3.ZeroReadOnly);
	}
}

SceneManager.RegisterClass("Paddle", Paddle);
