import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { getFrontendSceneData } from "../PongGame";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { type int, RandomRange, Vector3 } from "@babylonjs/core";
import { FrontendSceneData } from "../FrontendSceneData";
import { Platform } from "@shared/attachedScripts/Platform";
import { Paddle } from "@shared/attachedScripts/Paddle";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { Ball } from "@shared/attachedScripts/Ball";
import { ShotFactory } from "../ShotFactory";
import type { Shot } from "../Shot";
import { getRandomWeightedIndex } from "../utilities";
import { botDifficulty, type BotDifficulty } from "../BotDifficulty";

export class Bot extends CustomScriptComponent {
	private static readonly _paddleMinimumMovement = 0.3;

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
	private _shotFactory! : ShotFactory;
	private _targetHeight : number = 0;
	private _sceneData : FrontendSceneData;
	private _difficultySettings : BotDifficulty[keyof BotDifficulty];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Bot") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);

		if (this._sceneData.gameType !== "Bot")
			SceneManager.DestroyScriptComponent(this);
		this._difficultySettings = botDifficulty[this._sceneData.difficulty ?? "normal"];
    }

	protected	awake()
	{
		this._shotFactory = new ShotFactory(this._top, this._bottom, this._goalLeft, this._paddleRight, this._ball);
		this._timerManager.setInterval(this.refreshGameView.bind(this), 1000);
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
		const	delay = RandomRange(0, this._difficultySettings.refreshIntervalMaxAdditionMs);
		const	targetHeight = this.getTargetHeight();

		this._timerManager.setTimeout(() => {
			this._targetHeight = targetHeight;
		}, delay);
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
		const	direction = this._ball.getLinearVelocity();
		const	paddleMiddle = this.getTargetHeightRecursive(startPosition, direction, this._difficultySettings.maxReboundCalculationRecursion)
		const	displacement = (paddleMiddle === null) ?
			this.getHeightDisplacementForDefense() :
			this.getHeightDisplacementForAttack(paddleMiddle)

		const	targetHeight = (paddleMiddle ?? 0) + displacement;

		return targetHeight;
	}

	private	getHeightDisplacementForDefense() : number
	{
		return 0;
	}

	private	getHeightDisplacementForAttack(paddleMiddle : number) : number
	{
		const	targetHeight = this.getHeightTargetAttack();
		const	shots = this._shotFactory.getShotsAtHeight(targetHeight, paddleMiddle, 2);
		const	scores = shots.map((shot : Shot) => shot.score);
		const	selectedShotIndex = getRandomWeightedIndex(scores);
		const	selectedShot = shots[selectedShotIndex];
		const	displacement = this._paddleRight.getHeightDisplacementForAngle(selectedShot.angle);

		return displacement;
	}

	private	getHeightTargetAttack() : number
	{
		if (Math.random() > this._difficultySettings.shootAtOppositeProbability)
			return RandomRange(-this._difficultySettings.rangeForRandom / 2, this._difficultySettings.rangeForRandom / 2);
		if (this._paddleLeft.transform.absolutePosition.y > 0)
			return -Paddle.range / 2 + 0.1;
		return Paddle.range / 2 + 0.1;
	}

	private	getTargetHeightRecursive(startPosition: Vector3, direction : Vector3, maxRecursion : int) : number | null
	{
		if (maxRecursion <= 0 || direction.length() == 0)
			return 0;
		const	castVector = direction.normalize().scale(100);
		const	endPosition = startPosition.add(castVector);
		const	hitWorldResult = this._ball.shapeCast(startPosition, endPosition);
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
		return null;
	}

	private	getPlatformScript(transform : TransformNode)
	{
		if (transform === this._top.transform)
			return this._top;
		if (transform === this._bottom.transform)
			return this._bottom;
		return null;
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
