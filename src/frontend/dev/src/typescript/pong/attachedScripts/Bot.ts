import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { type IPhysicsShapeCastQuery, SceneManager } from "@babylonjs-toolkit/next";
import { getFrontendSceneData } from "../PongGame";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { type int, ShapeCastResult, Vector3 } from "@babylonjs/core";
import { FrontendSceneData } from "../FrontendSceneData";
import { Platform } from "@shared/attachedScripts/Platform";
import { Paddle } from "@shared/attachedScripts/Paddle";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { Ball } from "@shared/attachedScripts/Ball";

export class Bot extends CustomScriptComponent {
	private static readonly _paddleMinimumMovement = 0.3;
	private static readonly _refreshIntervalMs = 1000;
	private static readonly _maxReboundCalculationRecursion = 4;

	@Imported("InputManager") private	_inputManager! : InputManager;
	@Imported("TimerManager") private _timerManager! : TimerManager;
	@Imported("Paddle") private _paddleRight! : Paddle;
	@Imported("Paddle") private _paddleLeft! : Paddle;
	@Imported(TransformNode) private _goalRight! : TransformNode;
	@Imported(TransformNode) private _goalLeft! : TransformNode;
	@Imported("Platform") private _bottom! : Platform;
	@Imported("Platform") private _top! : Platform;
	@Imported("Ball") private _ball! : Ball;

	private _inputs! : PlayerInput;
	private _targetHeight : number = 0;
	private _sceneData : FrontendSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Bot") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);

		if (this._sceneData.gameType !== "Bot")
			SceneManager.DestroyScriptComponent(this);
    }

	protected	awake()
	{
		this._sceneData.events.getObservable("game-start").add(() => {
			this._timerManager.setInterval(this.refreshGameView.bind(this), Bot._refreshIntervalMs);
		});
	}

	protected	start()
	{
		this._inputs = this._inputManager.getPlayerInput(1);
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
		const	direction = this._targetHeight - this._paddleRight.transform.absolutePosition.y;

		if (Math.abs(direction) < Bot._paddleMinimumMovement)
			return 0;
		return direction;
	}
	
	private	getTargetHeight() : number
	{
		const	startPosition = this._ball.transform.absolutePosition;
		const	direction = this._ball.getPhysicsBody().getLinearVelocity();
		const	paddleMiddle = this.getTargetHeightRecursive(startPosition, direction, Bot._maxReboundCalculationRecursion)
		const	targetAngle = this.getAnglesToScoreAtHeight(-Paddle._range / 2 + 0.5, paddleMiddle);
		const	displacement = this._paddleRight.getHeightDisplacementForAngle(targetAngle);
		const	targetHeight = paddleMiddle + displacement;

		return targetHeight;
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

		if (transform === this._paddleRight.transform)
			return hitPoint.y;
		if (transform === this._goalRight)
		{
			const	slope = castVector.y / castVector.x;
			const	ballWidth = this._ball.transform.absoluteScaling.x;
			const	yFix = ballWidth * slope;

			return hitPoint.y - yFix;
		}
		const	platformScript = this.getPlatformScript(transform);

		if (platformScript)
		{
			const	newVelocity = platformScript.getNewVelocity(direction);

			return this.getTargetHeightRecursive(hitPoint, newVelocity, maxRecursion - 1);
		}
		return 0;
	}

	private	getAnglesToScoreAtHeight(height : number, paddleMiddle : number)
	{
		const	endPosX = this._goalLeft.absolutePosition.x + this._goalLeft.absoluteScaling.x / 2 + this._ball.transform.absoluteScaling.x / 2;
		const	endPos = new Vector3(endPosX, height, 0);
		const	startPosX = this._paddleRight.transform.absolutePosition.x - this._paddleRight.transform.absoluteScaling.x / 2 - this._ball.transform.absoluteScaling.x / 2;
		const	startPos = new Vector3(startPosX, paddleMiddle, 0);
		
		const	shotWithoutRebound = endPos.subtract(startPos);
		const	angleWithoutRebound = Vector3.GetAngleBetweenVectors(this.transform.right, shotWithoutRebound, Vector3.Forward());

		const	distEndToTop = height - (this._top.transform.absolutePosition.y - this._top.transform.absoluteScaling.x / 2);
		const	distStartToTop = paddleMiddle - (this._top.transform.absolutePosition.y - this._top.transform.absoluteScaling.x / 2);
		const	shotWithTopRebound = new Vector3(shotWithoutRebound.x, - (distEndToTop + distStartToTop), 0);
		const	angleWithTopRebound = Vector3.GetAngleBetweenVectors(this.transform.right, shotWithTopRebound, Vector3.Forward());

		return angleWithTopRebound;
	}

	private	getPlatformScript(transform : TransformNode)
	{
		if (transform === this._top.transform)
			return this._top;
		if (transform === this._bottom.transform)
			return this._bottom;
		return null;
	}

	private	shapeCastBall(startPosition : Vector3, endPosition : Vector3) : ShapeCastResult
	{
		const	shapeLocalResult : ShapeCastResult = new ShapeCastResult();
		const	hitWorldResult : ShapeCastResult = new ShapeCastResult();
		const	query : IPhysicsShapeCastQuery = {
			shape: this._ball.getPhysicsBody().shape!,
			rotation: this._ball.transform.rotationQuaternion!,
			startPosition: startPosition,
			endPosition: endPosition,
			shouldHitTriggers: true,
			ignoreBody: this._ball.getPhysicsBody()
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
}

SceneManager.RegisterClass("Bot", Bot);
