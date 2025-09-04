import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { EventState, IBasePhysicsCollisionEvent, PhysicsEventType, Vector3 } from "@babylonjs/core";

export class BouncingPlateform extends ScriptComponent {
    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "BouncingPlateform") {
        super(transform, scene, properties, alias);
    }

	protected	start()
	{
		globalThis.HKP?.onTriggerCollisionObservable.add(this.onTriggerEnter.bind(this));
	}

	private onTriggerEnter(collisionEvent : IBasePhysicsCollisionEvent, _eventState : EventState) : void
	{
		if (collisionEvent.collidedAgainst.transformNode !== this.transform
			|| collisionEvent.type !== PhysicsEventType.TRIGGER_ENTERED)
			return ;
		const	velocity : Vector3 = collisionEvent.collider.getLinearVelocity();

		velocity.scaleInPlace(-1);
		collisionEvent.collider.setLinearVelocity(velocity);
	}
}

SceneManager.RegisterClass("BouncingPlateform", BouncingPlateform);
