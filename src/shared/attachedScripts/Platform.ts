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
		const	ballPenetration = this.getBallPenetration(collidedAgainst);
		const	currentVelocity = collidedAgainst.getLinearVelocity();
		const	oppositeSlope = currentVelocity.x / currentVelocity.y;
		collidedAgainst.transformNode.absolutePosition.y += ballPenetration;
		collidedAgainst.transformNode.absolutePosition.x += ballPenetration * oppositeSlope;

		const	newVelocity = this.getNewVelocity(currentVelocity);

		collidedAgainst.setLinearVelocity(newVelocity);
	}

	private	getBallPenetration(collidedAgainst : PhysicsBody)
	{
		const	platformY = this.transform.absolutePosition.y;
		const	ballY = collidedAgainst.transformNode.absolutePosition.y;
		const	platformWidth = this.transform.absoluteScaling.x;
		const	ballHeight = collidedAgainst.transformNode.absoluteScaling.y;

		if (ballY < platformY)
			return (platformY - platformWidth / 2) - (ballY + ballHeight / 2);
		else
			return (platformY + platformWidth / 2) - (ballY - ballHeight / 2);
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
