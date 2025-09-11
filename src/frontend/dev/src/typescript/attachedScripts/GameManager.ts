import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Epsilon, Vector3 } from "@babylonjs/core";

interface TransformRef
{
	transform : TransformNode;
}

export class GameManager extends ScriptComponent {
	private static _paddleRange : number = 7.4;

	private	_goalLeft! : IUnityTransform & TransformRef;
	private	_goalRight! : IUnityTransform & TransformRef;
	private	_ball! : IUnityTransform & TransformRef;

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);
		globalThis.HKP!.onTriggerCollisionObservable.add(this.OnTriggerEvent.bind(this));
    }

	private OnTriggerEvent(eventData : IBasePhysicsCollisionEvent)
	{
		if (eventData.type === PhysicsEventType.TRIGGER_ENTERED
			|| eventData.collider.transformNode !== this._ball.transform)
			return ;
		const	collidedNode = eventData.collidedAgainst.transformNode;

		if (collidedNode === this._goalLeft.transform)
			this._scoreLeft++;
		else if (collidedNode === this._goalRight.transform)
			this._scoreRight++;
		else
			return ;
		this._ball.transform.position = Vector3.Zero();
		this._ball.transform.getPhysicsBody()!.setLinearVelocity(Vector3.Right().scale(6));
		console.log("scores : [" + this._scoreLeft + "," + this._scoreRight + "]")
	}

	protected awake()
	{
		this._goalLeft.transform = SceneManager.GetTransformNodeByID(this.scene, this._goalLeft.id);
		this._goalRight.transform = SceneManager.GetTransformNodeByID(this.scene, this._goalRight.id);
		this._ball.transform = SceneManager.GetTransformNodeByID(this.scene, this._ball.id);
	}

	protected start()
	{
		this._ball.transform.getPhysicsBody()!.disablePreStep = false;
	}

	public getPaddleMovementRange()
	{
		return GameManager._paddleRange + Epsilon;
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
