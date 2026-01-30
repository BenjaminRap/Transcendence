import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { InputKey } from "@shared/InputKey";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getFrontendSceneData } from "../PongGame";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { Ball } from "@shared/attachedScripts/Ball";
import { Paddle } from "@shared/attachedScripts/Paddle";
import type { Platform } from "@shared/attachedScripts/Platform";
import { PongError } from "@shared/pongError/PongError";
import type { GameInfos } from "@shared/ZodMessageType";
import { toVec3 } from "@shared/utils";
import type { TimerManager } from "@shared/attachedScripts/TimerManager";

export class ClientSync extends CustomScriptComponent {
	private static readonly _updatePing = 1000;

	@Imported("InputManager") private	_inputManager! : InputManager;
	@Imported("GameManager") private	_gameManager! : GameManager;
	@Imported("TimerManager") private	_timerManager! : TimerManager;
	@Imported("Ball") private _ball! : Ball;
	@Imported("Paddle") private _paddleRight! : Paddle;
	@Imported("Paddle") private _paddleLeft! : Paddle;
	@Imported("Platform") private _top! : Platform;
	@Imported("Platform") private _bottom! : Platform;

	private _sceneData : FrontendSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ClientSync") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected	awake()
	{
		if (this._sceneData.gameType !== "Multiplayer")
			return ;

		this.listenToGameInfos();
		this._sceneData.serverProxy.updatePing();
		this._timerManager.setInterval(() => {
			this._sceneData.serverProxy.updatePing();
		}, ClientSync._updatePing);
	}

	
	private	listenToGameInfos()
	{
		this._sceneData.events.getObservable("game-infos").add((gameInfos : GameInfos) => {
			const	opponentInputs = this._inputManager.getPlayerInput(this._sceneData.serverProxy.getOpponentIndex());

			switch (gameInfos.type)
			{
			case "room-closed":
				this.updateKey({event: "keyUp"}, opponentInputs.up);
				this.updateKey({event: "keyUp"}, opponentInputs.up);
				break ;
			case "forfeit":
				const	winningSide = (this._sceneData.serverProxy.getPlayerIndex() === 0) ? "left" : "right";

				this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
				break ;
			case "input":
				this.updateKey(gameInfos.keysUpdate.up, opponentInputs.up);
				this.updateKey(gameInfos.keysUpdate.down, opponentInputs.down);
				break ;
			case "itemsUpdate":
				const	ping = this._sceneData.serverProxy.getPing();
				const	currentPos  = this._ball.transform.position;
				const	serverPos = toVec3(gameInfos.itemsUpdate.ball.pos);
				const	serverVelocity = toVec3(gameInfos.itemsUpdate.ball.linearVelocity);
				const	calculated = this.caculateNewPosAndVelocity(serverPos, serverVelocity, ping / 2000);
				const	final = this.chooseBestValue(currentPos, calculated, [serverPos, serverVelocity]);

				this._ball.transform.position.copyFrom(final[0]);
				this._ball.setLinearVelocity(final[1]);
				this._paddleLeft.transform.position.copyFrom(toVec3(gameInfos.itemsUpdate.paddleLeftPos));
				this._paddleRight.transform.position.copyFrom(toVec3(gameInfos.itemsUpdate.paddleRightPos));
				break ;
			case "goal":
				this._ball.setBallStartDirection(toVec3(gameInfos.goal.newBallDirection));
				this._gameManager.onGoal(gameInfos.goal.side);
				break ;
			}
		});
	}

	private	chooseBestValue(currentPos : Vector3, calculated : [Vector3, Vector3], server : [Vector3, Vector3]) : [Vector3, Vector3]
	{
		if (Vector3.Distance(currentPos, calculated[0]) < Vector3.Distance(currentPos, server[0]))
			return calculated;
		return server;
	}

	private	updateKey(keyUpdate : { event: "keyDown" | "keyUp" } | undefined, inputKey : InputKey)
	{
		if (!keyUpdate)
			return ;
		if (keyUpdate.event === "keyDown")
			inputKey.setKeyDown();
		else
			inputKey.setKeyUp();
	}

	private	caculateNewPosAndVelocity(startPosition: Vector3, velocity : Vector3, remainingTimeSeconds : number, maxRecursion = 2) : [Vector3, Vector3]
	{
		if (maxRecursion <= 0)
			return [startPosition, velocity];
		const	castVector = velocity.scale(remainingTimeSeconds);
		const	endPosition = startPosition.add(castVector);
		const	hitWorldResult = this._ball.shapeCast(startPosition, endPosition);

		if (!hitWorldResult.hasHit || !hitWorldResult.body)
			return [endPosition, velocity];
		const	newRemainingTime = (1 - hitWorldResult.hitFraction) * remainingTimeSeconds;
		const	transform = hitWorldResult.body.transformNode;
		const	hitPoint = startPosition.add(castVector.scale(hitWorldResult.hitFraction));

		const	colliderScript = this.getPlatformScript(transform) ?? this.getPaddleScript(transform);;

		if (colliderScript)
		{
			const	newVelocity = colliderScript.getNewVelocity(velocity);

			return this.caculateNewPosAndVelocity(hitPoint, newVelocity, newRemainingTime);
		}
		return [endPosition, velocity];
	}

	private	getPlatformScript(transform : TransformNode)
	{
		if (transform === this._top.transform)
			return this._top;
		if (transform === this._bottom.transform)
			return this._bottom;
		return null;
	}

	private	getPaddleScript(transform : TransformNode)
	{
		if (transform === this._paddleLeft.transform)
			return this._paddleLeft;
		if (transform === this._paddleRight.transform)
			return this._paddleRight;
		return null;
	}
}

SceneManager.RegisterClass("ClientSync", ClientSync);
