import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsRaycastResult } from "@babylonjs/core/Physics/physicsRaycastResult";
import { IPhysicsEngine } from "@babylonjs/core/Physics/IPhysicsEngine";
import { Logger } from "@babylonjs/core/Misc/logger";

export class Ball extends ScriptComponent {
	public initialDirection : Vector3 = Vector3.Right();
	public speed : number = 1;

	private _physicsEngine : IPhysicsEngine;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
        super(transform, scene, properties, alias);
		this.initialDirection.normalize();

		const	physicsEngine : IPhysicsEngine | null = this.scene.getPhysicsEngine();

		if (physicsEngine === null)
			throw new Error("Physics is not enabled in the scene !");
		this._physicsEngine = physicsEngine;
    }
	
	update() : void
	{
		const	directionLength : number = this.speed * this.getDeltaTime();
		const	movement : Vector3 = this.initialDirection.scale(directionLength);
		const	destination : Vector3 = this.transform.position.add(movement);
		const	res : PhysicsRaycastResult = this._physicsEngine.raycast(this.transform.position, destination);

		if (res.hasHit) {
			Logger.Log("Collision at " + res.hitPointWorld);
		}
		this.transform.position = destination;
	}
}

SceneManager.RegisterClass("Ball", Ball);
