import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, type IPhysicsShapeCastQuery } from "@babylonjs-toolkit/next";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { getSceneData, SceneData } from "@shared/SceneData";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { Imported } from "@shared/ImportedDecorator";
import { zodNumber } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { ShapeCastResult } from "@babylonjs/core/Physics/shapeCastResult";
import { PongError } from "@shared/pongError/PongError";

export class Ball extends CustomScriptComponent {
	private static readonly _startMaxAngleRadian = Math.PI / 6;

	@Imported("TimerManager") private _timerManager! : TimerManager;
	@Imported(zodNumber) private _initialSpeed! : number;
	@Imported(zodNumber) private _goalTimeoutMs! : number;

	private _physicsBody! : PhysicsBody;
	private _initialPosition : Vector3;
	private _startsRight : boolean = true;
	private	_ballStartTimeout : number | null = null;
	private _sceneData : SceneData;
	private _startDirection : Vector3 = Vector3.Right();

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
		super(transform, scene, properties, alias);
		this._initialPosition = transform.position.clone();

		this._sceneData = getSceneData(this.scene);

		if (this._sceneData.gameType !== "Multiplayer")
			this.setBallRandomStartDirection();
		this._sceneData.events.getObservable("game-start").add(() => {
			this.launch();
		});
    }

	protected	start()
	{
		const	physicsBody = this.transform.getPhysicsBody();

		if (!physicsBody)
			throw new PongError("The Ball script should be attached to a mesh with a physic body !", "quitScene");
		this._physicsBody = physicsBody;
		this._physicsBody.disablePreStep = false;
	}

	public launch() : void
	{
		this.reset();
		this._ballStartTimeout = this._timerManager.setTimeout(() => {
			this.transform.position.copyFrom(this._initialPosition);
			const	velocity = this._startDirection.scale(this._initialSpeed);

			if (this._sceneData.gameType !== "Multiplayer")
				this.setBallRandomStartDirection();
			this._physicsBody.setLinearVelocity(velocity);
			this._ballStartTimeout = null;
		}, this._goalTimeoutMs);
	}

	private	getColliderPenetration(collider : TransformNode, axis : "x" | "y")
	{
		const	colliderPos = collider.absolutePosition[axis];
		const	ballPos = this.transform.absolutePosition[axis];
		const	colliderWidth = collider.absoluteScaling.x;
		const	ballWidth = this.transform.absoluteScaling.x;
		const	colliderPenetration = (ballPos < colliderPos) ?
			(colliderPos - colliderWidth / 2) - (ballPos + ballWidth / 2) :
			(colliderPos + colliderWidth / 2) - (ballPos - ballWidth / 2)
	
		return colliderPenetration;
	}

	public reverseColliderPenetration(collider : TransformNode, axis : "x" | "y")
	{
		const	colliderPenetration = this.getColliderPenetration(collider, axis);
		const	velocity = this._physicsBody.getLinearVelocity();
		const	oppositeAxis = (axis === "x") ? "y" : "x";
		const	slope = velocity[oppositeAxis] / velocity[axis];

		const	displacement = new Vector3();

		displacement[axis] = colliderPenetration;
		displacement[oppositeAxis] = colliderPenetration * slope;

		const	newAbsolutionPosition = this.transform.absolutePosition.add(displacement);

		this.transform.setAbsolutePosition(newAbsolutionPosition);
	}

	public reset() : void
	{
		if (this._ballStartTimeout !== null)
		{
			this._timerManager.clearTimer(this._ballStartTimeout);
			this._ballStartTimeout = null;
		}
		this.transform.position.copyFrom(this._initialPosition);
		this._physicsBody.setLinearVelocity(Vector3.Zero());
	}

	private	setBallRandomStartDirection()
	{
		const	sideVector = this._startsRight ? Vector3.Right() : Vector3.Left();
		const	angle = (Math.random() - 0.5) * Ball._startMaxAngleRadian * 2;
		const	rotation = Quaternion.RotationAxis(Vector3.LeftHandedForwardReadOnly, angle);

		this._startDirection = sideVector.applyRotationQuaternion(rotation);
		this._startsRight = !this._startsRight;
	}

	public setBallStartDirection(direction : Vector3) {
		this._startDirection = direction;
	}

	public getBallStartDirection() : Vector3 {
		return this._startDirection;
	}

	public	shapeCast(startPosition : Vector3, endPosition : Vector3) : ShapeCastResult
	{
		const	shapeLocalResult : ShapeCastResult = new ShapeCastResult();
		const	hitWorldResult : ShapeCastResult = new ShapeCastResult();
		const	query : IPhysicsShapeCastQuery = {
			shape: this._physicsBody.shape!,
			rotation: this.transform.rotationQuaternion!,
			startPosition: startPosition,
			endPosition: endPosition,
			shouldHitTriggers: true,
			ignoreBody: this._physicsBody
		};

		this._sceneData.havokPlugin.shapeCast(query, shapeLocalResult, hitWorldResult);
		return hitWorldResult;
	}

	public getLinearVelocity()
	{
		return this._physicsBody.getLinearVelocity();
	}

	public setLinearVelocity(linearVelocity : Vector3)
	{
		if (this._ballStartTimeout !== null)
			return ;
		this._physicsBody.setLinearVelocity(linearVelocity);
	}

	public isInResetTimeout()
	{
		return (this._ballStartTimeout !== null);
	}
}

SceneManager.RegisterClass("Ball", Ball);
