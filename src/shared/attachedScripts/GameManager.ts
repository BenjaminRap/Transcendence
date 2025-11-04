import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { LocalMessageBus, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Ball } from "@shared/attachedScripts/Ball";

export class GameManager extends ScriptComponent {

	public readonly messageBus  = new LocalMessageBus();

	private	_goalLeft! : TransformNode;
	private	_goalRight! : TransformNode;
	private	_ball! : TransformNode & { script : Ball};

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
			this.messageBus.PostMessage("scoreFromRight", this._scoreRight);
		}
		else if (collidedNode === this._goalRight)
		{
			this._scoreLeft++;
			this.messageBus.PostMessage("scoreFromLeft", this._scoreLeft);
		}
		else
			return ;
		this._ball.script.reset();
	}

	protected awake()
	{
		this._ball.script = SceneManager.GetComponent<Ball>(this._ball, "Ball", false);
	}

	protected destroy()
	{
		this.messageBus.Dispose();
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
