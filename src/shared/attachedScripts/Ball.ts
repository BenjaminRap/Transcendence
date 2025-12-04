import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { getSceneData } from "@shared/SceneData";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { Imported } from "@shared/ImportedDecorator";
import { zodNumber } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class Ball extends CustomScriptComponent {
	@Imported("TimerManager") private _timerManager! : TimerManager;
	@Imported(zodNumber) private _initialSpeed! : number;
	@Imported(zodNumber) private _goalTimeoutMs! : number;

	private _physicsBody! : PhysicsBody;
	private _initialPosition : Vector3;
	private _startsRight : boolean = true;
	private	_ballStartTimeout : number | null = null;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
		super(transform, scene, properties, alias);
		this._initialPosition = transform.position.clone();

		const	sceneData = getSceneData(this.scene);

		sceneData.events.getObservable("game-start").add(() => {
			this.launch();
		});
    }

	protected	start()
	{
		const	physicsBody = this.transform.getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
		this._physicsBody.disablePreStep = false;
	}

	public launch() : void
	{
		this._ballStartTimeout = this._timerManager.setTimeout(() => {
			this.transform.position.copyFrom(this._initialPosition);
			const	direction = this.getBallStartDirection();
			const	velocity = direction.scale(this._initialSpeed);

			this._physicsBody.setLinearVelocity(velocity);
			this._startsRight = !this._startsRight;
			this._ballStartTimeout = null;
		}, this._goalTimeoutMs);
	}

	private	getColliderPenetration(collider : TransformNode, axis : "x" | "y", widthAxis : "x" | "y" = "x")
	{
		const	colliderPos = collider.absolutePosition[axis];
		const	ballPos = this.transform.absolutePosition[axis];
		const	colliderWidth = collider.absoluteScaling[widthAxis];
		const	ballWidth = this.transform.absoluteScaling[widthAxis];
		const	colliderPenetration = (ballPos < colliderPos) ?
			(colliderPos - colliderWidth / 2) - (ballPos + ballWidth / 2) :
			
			(colliderPos + colliderWidth / 2) - (ballPos - ballWidth / 2)
	
		return colliderPenetration;
	}

	public getColliderPenetrationAxis(collider : TransformNode)
	{
		const	velocity = this._physicsBody.getLinearVelocity();
		const	colliderPenetrationX = this.getColliderPenetration(collider, "x");
		const	colliderPenetrationY = this.getColliderPenetration(collider, "y", "y");
		
		if (Math.abs(colliderPenetrationY / velocity.y) > Math.abs(colliderPenetrationX / velocity.x))
			return "x";
		return "y";
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

	private getBallStartDirection() : Vector3
	{
		if (this._startsRight)
			return Vector3.Right();
		else
			return Vector3.Left();
	}

	public getPhysicsBody()
	{
		return this._physicsBody;
	}

	public setLinearVelocity(linearVelocity : Vector3)
	{
		if (this._ballStartTimeout !== null)
			return ;
		this._physicsBody.setLinearVelocity(linearVelocity);
	}
}

SceneManager.RegisterClass("Ball", Ball);
