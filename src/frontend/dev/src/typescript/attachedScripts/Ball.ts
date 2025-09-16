import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";

export class Ball extends ScriptComponent {
	private _initialSpeed : number = 6;

	private _physicsBody! : PhysicsBody;
	private _initialPosition : Vector3;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
        super(transform, scene, properties, alias);
		this._initialPosition = transform.position.clone();
    }

	protected start()
	{
		const	physicsBody = this.getAbstractMesh().getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
		this._physicsBody.disablePreStep = false;
	}

	protected ready() : void
	{
		this.reset();
	}

	public reset() : void
	{
		this.transform.position.copyFrom(this._initialPosition);

		const	direction = this.getBallDirection();
		const	velocity = direction.scale(this._initialSpeed);

		this._physicsBody.setLinearVelocity(velocity);
	}

	private getBallDirection() : Vector3
	{
		return Vector3.Right();
	}
}

SceneManager.RegisterClass("Ball", Ball);
