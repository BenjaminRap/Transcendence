import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { getSceneData } from "@shared/SceneData";
import { TimerManager } from "./TimerManager";

export class Ball extends ScriptComponent {
	private _initialSpeed : number = 6;
	private _goalTimeoutMs : number = 500;

	private _physicsBody! : PhysicsBody;
	private _initialPosition : Vector3;
	private _startsRight : boolean = true;
	private _timerManager! : TransformNode;
	private	_ballStartTimeout : number | null = null;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Ball") {
        super(transform, scene, properties, alias);
		this._initialPosition = transform.position.clone();

		const	sceneData = getSceneData(this.scene);

		sceneData.events.getObservable("game-start").add(() => {
			this.launch();
		});
    }

	protected	start()
	{
		const	physicsBody = this.transform.getPhysicsBody();

		if (!physicsBody)
			throw new Error("The Ball script should be attached to a mesh with a physic body !");
		this._physicsBody = physicsBody;
		this._physicsBody.disablePreStep = false;
	}

	public launch() : void
	{
		this.reset();
		this._ballStartTimeout = SceneManager.GetComponent<TimerManager>(this._timerManager, "TimerManager", false).setTimeout(() => {
			const	direction = this.getBallDirection();
			const	velocity = direction.scale(this._initialSpeed);

			this._physicsBody.setLinearVelocity(velocity);
			this._startsRight = !this._startsRight;
			this._ballStartTimeout = null;
		}, this._goalTimeoutMs);
	}

	public reset() : void
	{
		if (this._ballStartTimeout !== null)
			SceneManager.GetComponent<TimerManager>(this._timerManager, "TimerManager", false).clearTimer(this._ballStartTimeout);
		this.transform.position.copyFrom(this._initialPosition);
		this._physicsBody.setLinearVelocity(Vector3.Zero());
	}

	private getBallDirection() : Vector3
	{
		if (this._startsRight)
			return Vector3.Right();
		else
			return Vector3.Left();
	}
}

SceneManager.RegisterClass("Ball", Ball);
