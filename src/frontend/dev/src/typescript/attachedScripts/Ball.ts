import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { ShapeCastResult } from "@babylonjs/core/Physics/shapeCastResult";

export class Ball extends ScriptComponent {
	private _initialDirection : Vector3 = Vector3.Right();
	private _speed : number = 6;
	private _overlapFactor : number = 1.3;

	private _physicsBody : PhysicsBody | undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
        super(transform, scene, properties, alias);
		this._initialDirection.normalize();
    }

	protected start()
	{
		const	physicsBody = this.getAbstractMesh().getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
	}

	protected ready() : void
	{
		this._physicsBody?.setLinearVelocity(this._initialDirection.scale(this._speed));
	}

	protected step()
	{
		const	direction : Vector3 = this._physicsBody!.getLinearVelocity().scale(globalThis.HKP!.getTimeStep() / this._overlapFactor);
		const	nextPosition = this.transform.absolutePosition.add(direction);

		let	shapeLocalResult = new ShapeCastResult();
		let	hitWorldResult = new ShapeCastResult();

		globalThis.HKP?.shapeCast({
			shape: this._physicsBody!.shape!,
			rotation: this.transform.absoluteRotationQuaternion,
			startPosition: this.transform.absolutePosition,
			endPosition: nextPosition,
			shouldHitTriggers: true,
			ignoreBody: this._physicsBody!
		}, shapeLocalResult, hitWorldResult);

		if (hitWorldResult.hasHit)
		{
			this._physicsBody?.setLinearVelocity(this._physicsBody.getLinearVelocity().scale(-1));
		}
	}
}

SceneManager.RegisterClass("Ball", Ball);
