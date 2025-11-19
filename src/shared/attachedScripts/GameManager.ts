import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { LocalMessageBus, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Ball } from "@shared/attachedScripts/Ball";
import { SceneData } from "@shared/SceneData";

export class GameManager extends ScriptComponent {

	public readonly messageBus  = new LocalMessageBus();

	private	_goalLeft! : TransformNode;
	private	_goalRight! : TransformNode;
	private	_ball! : TransformNode & { script : Ball};

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);

		const	sceneData = this.scene.metadata.sceneData;
		if (!(sceneData instanceof SceneData))
			throw new Error("The SceneData hasn't been attached to the scene !");
		sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }

	private onTriggerEvent(eventData : IBasePhysicsCollisionEvent)
	{
		if (eventData.type === PhysicsEventType.TRIGGER_ENTERED
			|| eventData.collider.transformNode !== this._ball.script.transform)
			return ;
		const	collidedNode = eventData.collidedAgainst.transformNode;

		if (collidedNode === this._goalLeft)
		{
			this._scoreRight++;
			this.messageBus.PostMessage("updateRightScore", this._scoreRight);
		}
		else if (collidedNode === this._goalRight)
		{
			this._scoreLeft++;
			this.messageBus.PostMessage("updateLeftScore", this._scoreLeft);
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

	public	restart()
	{
		this.messageBus.PostMessage("updateLeftScore", 0);
		this.messageBus.PostMessage("updateRightScore", 0);
		this._scoreLeft = 0;
		this._scoreRight = 0;
		this._ball.script.reset();
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
