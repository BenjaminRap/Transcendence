import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { LocalMessageBus, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Ball } from "@shared/attachedScripts/Ball";
import { SceneData } from "@shared/SceneData";
import { Vector3 } from "@babylonjs/core";

export class GameManager extends ScriptComponent {
	private	_goalLeft! : TransformNode;
	private	_goalRight! : TransformNode;
	private	_ball! : TransformNode & { script : Ball};

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;
	private _messageBus : LocalMessageBus;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);

		const	sceneData : SceneData = this.scene.metadata.sceneData;

		this._messageBus = sceneData.messageBus;
		sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }

	private onTriggerEvent(eventData : IBasePhysicsCollisionEvent)
	{
		if (eventData.type === PhysicsEventType.TRIGGER_ENTERED
			|| eventData.collider.transformNode !== this._ball
			|| eventData.collider.getLinearVelocity().equals(Vector3.ZeroReadOnly))
			return ;
		const	collidedNode = eventData.collidedAgainst.transformNode;

		if (collidedNode === this._goalLeft)
		{
			this._scoreRight++;
			this._messageBus.PostMessage("updateRightScore", this._scoreRight);
		}
		else if (collidedNode === this._goalRight)
		{
			this._scoreLeft++;
			this._messageBus.PostMessage("updateLeftScore", this._scoreLeft);
		}
		else
			return ;
		this._ball.script.reset();
	}

	protected awake()
	{
		this._ball.script = SceneManager.GetComponent<Ball>(this._ball, "Ball", false);
	}

	public	restart()
	{
		this._messageBus.PostMessage("reset");
		this._scoreLeft = 0;
		this._scoreRight = 0;
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
