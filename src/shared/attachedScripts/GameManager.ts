import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { LocalMessageBus, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { int } from "@babylonjs/core/types";
import { Ball } from "@shared/attachedScripts/Ball";
import { getSceneData, SceneData } from "@shared/SceneData";
import { Vector3 } from "@babylonjs/core";

export type EndData = {
	winner : "left" | "right" | "draw",
	forfeit : boolean
}

export class GameManager extends ScriptComponent {
	private static readonly _pointsToWin = 1;

	private	_goalLeft! : TransformNode;
	private	_goalRight! : TransformNode;
	private	_ball! : TransformNode & { script : Ball};

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;
	private _messageBus : LocalMessageBus;
	private _ended : boolean = false;
	private _sceneData : SceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);

		this._sceneData = getSceneData(this.scene);

		this._messageBus = this._sceneData.messageBus;

		if (this._sceneData.gameType !== "Multiplayer")
			this._sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }

	protected	ready()
	{
		this._messageBus.OnMessage("game-start", () => { this.reset() });
		this._messageBus.OnMessage("forfeit", (winner : "left" | "right" | "highestScore") => { this.endMatch(winner, true) });
		this._sceneData.readyPromise.resolve();
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
		if (side === "right")
		{
			this._scoreRight++;
			this._messageBus.PostMessage("updateRightScore", this._scoreRight);
			if (this._scoreRight === GameManager._pointsToWin)
				this.endMatch("right", false);
		}
		else
		{
			this._scoreLeft++;
			this._messageBus.PostMessage("updateLeftScore", this._scoreLeft);
			if (this._scoreLeft === GameManager._pointsToWin)
				this.endMatch("left", false);
		}
		if (!this._ended)
			this._ball.script.launch();
		else
			this._ball.script.reset();
	}

	private	endMatch(winner : "left" | "right" | "highestScore", forfeit: boolean)
	{
		if (this._ended)
			return ;
		this._ended = true;
		const	endData : EndData = {
			winner: (winner === "highestScore") ? this.getHighestScoreSide() : winner,
			forfeit: forfeit
		}
		this._messageBus.PostMessage("end", endData);
	}

	private	getHighestScoreSide()
	{
		if (this._scoreLeft > this._scoreRight)
			return "left";
		if (this._scoreRight > this._scoreLeft)
			return "right";
		return "draw";
	}

	protected awake()
	{
		this._ball.script = SceneManager.GetComponent<Ball>(this._ball, "Ball", false);
	}

	private	reset()
	{
		this._ended = false;
		this._scoreLeft = 0;
		this._scoreRight = 0;
	}

	public hasEnded()
	{
		return (this._ended);
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
