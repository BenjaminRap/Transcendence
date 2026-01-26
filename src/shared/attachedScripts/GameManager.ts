import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { type IBasePhysicsCollisionEvent, PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import type { int } from "@babylonjs/core/types";
import { Ball } from "@shared/attachedScripts/Ball";
import { getSceneData, SceneData } from "@shared/SceneData";
import { Vector3 } from "@babylonjs/core";
import { Imported } from "@shared/ImportedDecorator";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { toXYZ } from "@shared/utils";

export type EndData = {
	winner : "left" | "right" | "draw",
	forfeit : boolean,
	scoreRight: number,
	scoreLeft: number,
	duration: number
}

export class GameManager extends CustomScriptComponent {
	private static readonly _pointsToWin = 5;

	@Imported(TransformNode) private	_goalLeft! : TransformNode;
	@Imported(TransformNode) private	_goalRight! : TransformNode;
	@Imported("Ball") private	_ball! : Ball;

	private _scoreRight : int = 0;
	private _scoreLeft : int = 0;
	private _ended : boolean = true;
	private _sceneData : SceneData;
	private _isGamePaused : boolean = false;
	private _defaultTimeStep : number;
	private _startDate : number = 0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GameManager") {
        super(transform, scene, properties, alias);

		this._sceneData = getSceneData(this.scene);
		this._defaultTimeStep = this._sceneData.havokPlugin.getTimeStep();

		if (this._sceneData.gameType !== "Multiplayer")
			this._sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }

	protected	ready()
	{
		this._sceneData.events.getObservable("game-start").add(() => {
			this.reset();
			this.unPause();
		});
		this._sceneData.events.getObservable("forfeit").add((winner) => { this.endMatch(winner, true) });
		this._sceneData.readyPromise.resolve({
			ballStartDirection: toXYZ(this._ball.getBallStartDirection())
		});
	}

	private onTriggerEvent(eventData : IBasePhysicsCollisionEvent)
	{
		if (this._ended
			|| eventData.type === PhysicsEventType.TRIGGER_ENTERED
			|| eventData.collider.transformNode !== this._ball.transform
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
			this._sceneData.events.getObservable("updateRightScore").notifyObservers(this._scoreRight);
			if (this._scoreRight === GameManager._pointsToWin)
				this.endMatch("right", false);
		}
		else
		{
			this._scoreLeft++;
			this._sceneData.events.getObservable("updateLeftScore").notifyObservers(this._scoreLeft);
			if (this._scoreLeft === GameManager._pointsToWin)
				this.endMatch("left", false);
		}
		if (!this._ended)
			this._ball.launch();
		else
			this._ball.reset();
	}

	private	endMatch(winner : "left" | "right" | "highestScore", forfeit: boolean)
	{
		if (this._ended)
			return ;
		this._ended = true;
		const	endData : EndData = {
			winner: (winner === "highestScore") ? this.getHighestScoreSide() : winner,
			forfeit: forfeit,
			scoreLeft: this._scoreLeft,
			scoreRight: this._scoreRight,
			duration: Math.round((Date.now() - this._startDate) / 1000)
		}
		this._sceneData.events.getObservable("end").notifyObservers(endData);
	}

	private	getHighestScoreSide()
	{
		if (this._scoreLeft > this._scoreRight)
			return "left";
		if (this._scoreRight > this._scoreLeft)
			return "right";
		return "draw";
	}

	private	reset()
	{
		this._startDate = Date.now()
		this._ended = false;
		this._scoreLeft = 0;
		this._scoreRight = 0;
	}

	public hasEnded()
	{
		return (this._ended);
	}

	public pause()
	{
		if (this._isGamePaused || this._sceneData.gameType === "Multiplayer" || this._ended)
			return ;
		this._isGamePaused = true;
		this._sceneData.havokPlugin.setTimeStep(0);
		this._sceneData.events.getObservable("game-paused").notifyObservers();
	}

	public unPause()
	{
		if (!this._isGamePaused)
			return ;
		this._isGamePaused = false;
		this._sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
		this._sceneData.events.getObservable("game-unpaused").notifyObservers();
	}

	protected	destroy()
	{
		this.unPause();
	}
}

SceneManager.RegisterClass("GameManager", GameManager);
