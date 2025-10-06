import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Epsilon } from "@babylonjs/core";
import { Text } from "./Text"
import { Ball } from "./Ball";

export class GameManager extends ScriptComponent {
	private static _paddleRange : number = 9.4;

	private	_goalLeft! : TransformNode;
	private	_goalRight! : TransformNode;
	private	_ball! : TransformNode & { script : Ball};
	private	_scoreLeftText! : TransformNode & {text : Text};
	private	_scoreRightText! : TransformNode & {text : Text};

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);
		globalThis.HKP!.onTriggerCollisionObservable.add(this.OnTriggerEvent.bind(this));
    }

	private OnTriggerEvent(eventData : IBasePhysicsCollisionEvent)
	{
		if (eventData.type === PhysicsEventType.TRIGGER_ENTERED
			|| eventData.collider.transformNode !== this._ball.script.transform)
			return ;
		const	collidedNode = eventData.collidedAgainst.transformNode;

		if (collidedNode === this._goalLeft)
		{
			this._scoreRight++;
			this._scoreRightText.text.setText(this._scoreRight.toString());
		}
		else if (collidedNode === this._goalRight)
		{
			this._scoreLeft++;
			this._scoreLeftText.text.setText(this._scoreLeft.toString());
		}
		else
			return ;
		this._ball.script.reset();
	}

	protected awake()
	{
		this._scoreLeftText.text = SceneManager.GetComponent<Text>(this._scoreLeftText, "Text", false);
		this._scoreRightText.text = SceneManager.GetComponent<Text>(this._scoreRightText, "Text", false);
		this._ball.script = SceneManager.GetComponent<Ball>(this._ball, "Ball", false);
	}

	public getPaddleMovementRange()
	{
		return GameManager._paddleRange + Epsilon;
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
