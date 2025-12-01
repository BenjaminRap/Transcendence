import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { type IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getSceneData } from "@shared/SceneData";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class Platform extends CustomScriptComponent {

	private	_physicsBody! : PhysicsBody;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Platform") {
        super(transform, scene, properties, alias);

		const	sceneData = getSceneData(this.scene);

		sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
    }

	private onTriggerEnter(collision : IBasePhysicsCollisionEvent)
	{
		if (collision.type !== PhysicsEventType.TRIGGER_ENTERED
			|| collision.collidedAgainst !== this._physicsBody)
			return ;
		const	collidedAgainst = collision.collider;

		const	newVelocity = this.getNewVelocity(collidedAgainst.getLinearVelocity());

		collidedAgainst.setLinearVelocity(newVelocity);
	}

	public getNewVelocity(currentVelocity : Vector3) : Vector3
	{
		let	newVelocity = currentVelocity.clone();

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
