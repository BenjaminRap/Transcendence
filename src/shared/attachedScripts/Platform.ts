import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class Platform extends ScriptComponent {

	private	_physicsBody! : PhysicsBody;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Platform") {
        super(transform, scene, properties, alias);
		globalThis.HKP!.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
    }

	private onTriggerEnter(collision : IBasePhysicsCollisionEvent)
	{
		if (collision.type !== PhysicsEventType.TRIGGER_ENTERED
			|| collision.collidedAgainst !== this._physicsBody)
			return ;
		const	collidedAgainst = collision.collider;

		const	newVelocity = this.getNewVelocity(collidedAgainst);

		collidedAgainst.setLinearVelocity(newVelocity);
	}

	private getNewVelocity(collidedAgainst : PhysicsBody) : Vector3
	{
		let	newVelocity = collidedAgainst.getLinearVelocity();

		newVelocity.applyRotationQuaternionInPlace(this.transform.rotationQuaternion!.invert());
		newVelocity.x *= -1;
		newVelocity.applyRotationQuaternionInPlace(this.transform.rotationQuaternion!);

		return (newVelocity);
	}

	protected start()
	{
		const	physicsBody = this.transform.getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Platform script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
	}
}

SceneManager.RegisterClass("Platform", Platform);
