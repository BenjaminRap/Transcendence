import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { LocalMessageBus, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Ball } from "@shared/attachedScripts/Ball";
import { SceneData } from "@shared/SceneData";
import { Vector3 } from "@babylonjs/core";

export class GameManager extends ScriptComponent {
	private static readonly _pointsToWin = 20;

	private	_goalLeft! : TransformNode;
	private	_goalRight! : TransformNode;
	private	_ball! : TransformNode & { script : Ball};

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;
	private _messageBus : LocalMessageBus;
	private _ended : boolean = false;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);

		const	sceneData : SceneData = this.scene.metadata.sceneData;

		this._messageBus = sceneData.messageBus;

		if ((sceneData as any).gameType !== "Multiplayer")
			sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }

	private onTriggerEvent(eventData : IBasePhysicsCollisionEvent)
	{
		if (this._ended
			|| eventData.type === PhysicsEventType.TRIGGER_ENTERED
			|| eventData.collider.transformNode !== this._ball
			|| eventData.collider.getLinearVelocity().equals(Vector3.ZeroReadOnly))
			return ;
		const	collidedNode = eventData.collidedAgainst.transformNode;

		if (collidedNode === this._goalLeft)
			this.onGoal("right");
		else if (collidedNode === this._goalRight)
			this.onGoal("left");
	}

	public	onGoal(side : "right" | "left")
	{
		if (side === "left")
		{
			this._scoreRight++;
			this._messageBus.PostMessage("updateRightScore", this._scoreRight);
			if (this._scoreRight === GameManager._pointsToWin)
				this._ended = true;
		}
		else
		{
			this._scoreLeft++;
			this._messageBus.PostMessage("updateLeftScore", this._scoreLeft);
			if (this._scoreLeft === GameManager._pointsToWin)
				this._ended = true;
		}
		if (this._ended)
			this._messageBus.PostMessage("end");
		else
			this._ball.script.reset();
	}

	protected awake()
	{
		this._ball.script = SceneManager.GetComponent<Ball>(this._ball, "Ball", false);
	}

	public	restart()
	{
		this._ended = false;
		this._messageBus.PostMessage("reset");
		this._scoreLeft = 0;
		this._scoreRight = 0;
	}

	public hasEnded()
	{
		return (this._ended);
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
