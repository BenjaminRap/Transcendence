import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";

export class Ball extends ScriptComponent {
	private _initialDirection : Vector3 = Vector3.Right();
	private _speed : number = 6;

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
}

SceneManager.RegisterClass("Ball", Ball);
