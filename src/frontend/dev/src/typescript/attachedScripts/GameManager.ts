import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Epsilon, Vector3 } from "@babylonjs/core";
import { Text } from "./Text"

interface TransformRef
{
	transform : TransformNode;
}

export class GameManager extends ScriptComponent {
	private static _paddleRange : number = 9.4;

	private	_goalLeft! : IUnityTransform & TransformRef;
	private	_goalRight! : IUnityTransform & TransformRef;
	private	_ball! : IUnityTransform & TransformRef;
	private	_scoreLeftText! : IUnityTransform & {text : Text};
	private	_scoreRightText! : IUnityTransform & {text : Text};

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
		{
			this._scoreLeft++;
			this._scoreLeftText.text.setText(this._scoreLeft.toString());
		}
		else if (collidedNode === this._goalRight.transform)
		{
			this._scoreRight += 5;
			this._scoreRightText.text.setText(this._scoreRight.toString());
		}
		else
			return ;
		this._ball.transform.position = Vector3.Zero();
		this._ball.transform.getPhysicsBody()!.setLinearVelocity(Vector3.Right().scale(6));
	}

	protected awake()
	{
		this._goalLeft.transform = SceneManager.GetTransformNodeByID(this.scene, this._goalLeft.id);
		this._goalRight.transform = SceneManager.GetTransformNodeByID(this.scene, this._goalRight.id);
		this._ball.transform = SceneManager.GetTransformNodeByID(this.scene, this._ball.id);

		const	scoreLeftTextTransform = SceneManager.GetTransformNodeByID(this.scene, this._scoreLeftText.id);
		this._scoreLeftText.text = SceneManager.GetComponent<Text>(scoreLeftTextTransform, "Text", false);

		const	scoreRightTextTransform = SceneManager.GetTransformNodeByID(this.scene, this._scoreRightText.id);
		this._scoreRightText.text = SceneManager.GetComponent<Text>(scoreRightTextTransform, "Text", false);
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
