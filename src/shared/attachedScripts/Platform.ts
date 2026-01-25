import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { type IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getSceneData } from "@shared/SceneData";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import type { Ball } from "./Ball";
import { PongError } from "@shared/pongError/PongError";

export class Platform extends CustomScriptComponent {
	@Imported("Ball") private _ball! : Ball;

	private	_physicsBody! : PhysicsBody;
	private _isBallInsideCollider : boolean = false;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Platform") {
        super(transform, scene, properties, alias);

		const	sceneData = getSceneData(this.scene);

		sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }

	private onTriggerEvent(collision : IBasePhysicsCollisionEvent)
	{
		if (collision.collidedAgainst !== this._physicsBody
			|| collision.collider.transformNode !== this._ball.transform)
			return ;
		if (collision.type === PhysicsEventType.TRIGGER_ENTERED)
			this._isBallInsideCollider = true;
		else
			this._isBallInsideCollider = false;
	}

	protected	fixed()
	{
		if (!this._isBallInsideCollider)
			return ;
		const	currentVelocity = this._ball.getLinearVelocity();

		if (Math.sign(currentVelocity.y) !== Math.sign(this._ball.transform.absolutePosition.y))
			return ;
		this._ball.reverseColliderPenetration(this.transform, "y");

		const	newVelocity = this.getNewVelocity(currentVelocity);

		this._ball.setLinearVelocity(newVelocity);
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
			throw new PongError("The Platform script should be attached to a mesh with a physic body !", "quitScene");
		this._physicsBody = physicsBody;
	}
}

SceneManager.RegisterClass("Platform", Platform);
