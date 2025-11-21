import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";

export class Ball extends ScriptComponent {
	private _initialSpeed : number = 6;
	private _goalTimeoutMs : number = 500;

	private _physicsBody! : PhysicsBody;
	private _initialPosition : Vector3;
	private _startsRight : boolean = true;
	private	_ballStartTimeout : NodeJS.Timeout | null = null;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
        super(transform, scene, properties, alias);
		this._initialPosition = transform.position.clone();
    }

	protected	awake()
	{
		this.scene.metadata.sceneData.messageBus.OnMessage("reset", () => {
			this.reset();
		});
	}

	protected start()
	{
		const	physicsBody = this.transform.getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
		this._physicsBody.disablePreStep = false;
		this.reset();
	}

	public reset() : void
	{
		if (this._ballStartTimeout !== null)
			this._ballStartTimeout.close();
		this.transform.position.copyFrom(this._initialPosition);
		this._physicsBody.setLinearVelocity(Vector3.Zero());

		this._ballStartTimeout = setTimeout(() => {
			const	direction = this.getBallDirection();
			const	velocity = direction.scale(this._initialSpeed);

			this._physicsBody.setLinearVelocity(velocity);
			this._startsRight = !this._startsRight;
			this._ballStartTimeout = null;
		}, this._goalTimeoutMs);
	}

	private getBallDirection() : Vector3
	{
		if (this._startsRight)
			return Vector3.Right();
		else
			return Vector3.Left();
	}

	protected	destroy()
	{
		if (this._ballStartTimeout !== null)
			this._ballStartTimeout.close();
	}
}

SceneManager.RegisterClass("Ball", Ball);
