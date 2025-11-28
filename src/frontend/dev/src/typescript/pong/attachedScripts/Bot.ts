import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { IPhysicsShapeCastQuery, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { getFrontendSceneData } from "../PongGame";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { int, PhysicsBody, ShapeCastResult, Vector3 } from "@babylonjs/core";
import { FrontendSceneData } from "../FrontendSceneData";
import { Platform } from "@shared/attachedScripts/Platform";
import { Paddle } from "@shared/attachedScripts/Paddle";

export class Bot extends ScriptComponent {
	private static readonly _paddleMinimumMovement = 0.5;
	private static readonly _refreshIntervalMs = 1000;
	private static readonly _maxReboundCalculationRecursion = 4;

	private	_inputManager! : TransformNode;
	private _paddleRight! : TransformNode & { script : Paddle };
	private _paddleLeft! : TransformNode & { script : Paddle };
	private _goalRight! : TransformNode;
	private _goalLeft! : TransformNode;
	private _bottom! : TransformNode & { script: Platform };
	private _top! : TransformNode & { script: Platform };
	private _ball! : TransformNode & { physicsBody : PhysicsBody };

	private _inputs! : PlayerInput;
	private _updateInterval : number | undefined;
	private _targetHeight : number = 0;
	private _sceneData : FrontendSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Bot") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);

		if (this._sceneData.gameType !== "Bot")
			SceneManager.DestroyScriptComponent(this);
		this._sceneData.events.getObservable("game-start").add(() => {
			this._updateInterval = window.setInterval(this.refreshGameView.bind(this), Bot._refreshIntervalMs);
		});
    }

	protected	awake()
	{
		this._paddleRight.script = SceneManager.GetComponent<Paddle>(this._paddleRight, "Paddle", false);
		this._paddleLeft.script = SceneManager.GetComponent<Paddle>(this._paddleLeft, "Paddle", false);
		this._bottom.script = SceneManager.GetComponent<Platform>(this._bottom, "Platform", false);
		this._top.script = SceneManager.GetComponent<Platform>(this._top, "Platform", false);
	}

	protected	start()
	{
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this._inputs = inputManager.getPlayerInput(1);

		const	physicsBody = this._ball.getPhysicsBody();
		if (physicsBody == null)
			throw new Error("The ball doesn't have a physics body !");
		this._ball.physicsBody = physicsBody;
	}

	protected	update()
	{
		const	direction = this.getTargetDirection();

		this.setInput(direction);
	}

	private	refreshGameView()
	{
		this._targetHeight = this.getTargetHeight();
	}

	private	getTargetDirection() : number
	{
		const	direction = this._targetHeight - this._paddleRight.absolutePosition.y;

		if (Math.abs(direction) < Bot._paddleMinimumMovement)
			return 0;
		return direction;
	}
	
	private	getTargetHeight() : number
	{
		const	startPosition = this._ball.absolutePosition;
		const	direction = this._ball.physicsBody.getLinearVelocity();

		return this.getTargetHeightRecursive(startPosition, direction, Bot._maxReboundCalculationRecursion);
	}

	private	getTargetHeightRecursive(startPosition: Vector3, direction : Vector3, maxRecursion : int) : number
	{
		if (maxRecursion <= 0 || direction.length() == 0)
			return 0;
		const	castVector = direction.normalize().scale(100);
		const	endPosition = startPosition.add(castVector);
		const	hitWorldResult = this.shapeCastBall(startPosition, endPosition);
		if (!hitWorldResult.hasHit || !hitWorldResult.body)
			return 0;
		const	transform = hitWorldResult.body.transformNode;
		const	hitPoint = startPosition.add(castVector.scale(hitWorldResult.hitFraction));

		if (transform === this._paddleRight || transform === this._goalRight)
			return hitPoint.y;
		const	platformScript = this.getPlatformScript(transform);
		if (platformScript)
		{
			const	newVelocity = platformScript.getNewVelocity(direction);

			return this.getTargetHeightRecursive(hitPoint, newVelocity, maxRecursion - 1);
		}
		return 0;
	}

	private	getPlatformScript(transform : TransformNode)
	{
		if (transform === this._top)
			return this._top.script;
		if (transform === this._bottom)
			return this._bottom.script;
		return null;
	}

	private	shapeCastBall(startPosition : Vector3, endPosition : Vector3) : ShapeCastResult
	{
		const	shapeLocalResult : ShapeCastResult = new ShapeCastResult();
		const	hitWorldResult : ShapeCastResult = new ShapeCastResult();
		const	query : IPhysicsShapeCastQuery = {
			shape: this._ball.physicsBody.shape!,
			rotation: this._ball.rotationQuaternion!,
			startPosition: startPosition,
			endPosition: endPosition,
			shouldHitTriggers: true,
			ignoreBody: this._ball.physicsBody
		};

		this._sceneData.havokPlugin.shapeCast(query, shapeLocalResult, hitWorldResult);
		return hitWorldResult;
	}

	private	setInput(direction : number)
	{
		if (direction < 0)
		{
			this._inputs.up.setKeyUp();
			this._inputs.down.setKeyDown();
		}
		else if (direction > 0)
		{
			this._inputs.up.setKeyDown();
			this._inputs.down.setKeyUp();
		}
		else
		{
			this._inputs.up.setKeyUp();
			this._inputs.down.setKeyUp();
		}
	}

	protected	destroy()
	{
		if (this._updateInterval)
			clearInterval(this._updateInterval);
	}
}

SceneManager.RegisterClass("Bot", Bot);
