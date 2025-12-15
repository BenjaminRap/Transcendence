import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import type { GameInfos } from "@shared/ServerMessage";
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

export class ClientSync extends CustomScriptComponent {
	@Imported("InputManager") private	_inputManager! : InputManager;
	@Imported("GameManager") private	_gameManager! : GameManager;
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
	}
	
	private	listenToGameInfos()
	{
		const	serverProxy = this._sceneData.serverProxy;
	
		if (!serverProxy)
			return ;
		serverProxy.onServerMessage()!.add((gameInfos : GameInfos | "room-closed" | "server-error" | "forfeit") => {
			if (gameInfos === "room-closed" || gameInfos === "server-error")
				return ;
			if (gameInfos === "forfeit")
			{
				const	winningSide = (serverProxy.getPlayerIndex() === 0) ? "left" : "right";

				this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
			}
			else if (gameInfos.type === "input")
			{
				const	opponentInputs = this._inputManager.getPlayerInput(serverProxy.getOpponentIndex());

				this.updateKey(gameInfos.infos.up, opponentInputs.up);
				this.updateKey(gameInfos.infos.down, opponentInputs.down);
			}
			else if (gameInfos.type === "itemsUpdate")
			{
				this._ball.transform.position.copyFrom(this.xyzToVector3(gameInfos.infos.ball.pos));
				this._ball.transform.getPhysicsBody()!.setLinearVelocity(this.xyzToVector3(gameInfos.infos.ball.linearVelocity));
				this._paddleLeft.transform.position.copyFrom(this.xyzToVector3(gameInfos.infos.paddleLeftPos));
				this._paddleRight.transform.position.copyFrom(this.xyzToVector3(gameInfos.infos.paddleRightPos));
			}
			else if (gameInfos.type === "goal")
				this._gameManager.onGoal(gameInfos.infos.side);
		});
	}
	
	private	xyzToVector3(xyz : {x : number, y : number, z : number})
	{
		return new Vector3(xyz.x, xyz.y, xyz.z);
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

	private	getNewPosition(startPosition: Vector3, velocity : Vector3, remainingTimeSeconds : number) : Vector3
	{
		const	velocityLength = velocity.length();
		if (velocityLength == 0)
			return startPosition;
		const	castVector = velocity.normalize().scale(velocityLength * remainingTimeSeconds);
		const	endPosition = startPosition.add(castVector);
		const	hitWorldResult = this._ball.shapeCast(startPosition, endPosition);

		if (!hitWorldResult.hasHit || !hitWorldResult.body)
			return endPosition;
		const	newRemainingTime = (1 - hitWorldResult.hitFraction) * remainingTimeSeconds;
		const	transform = hitWorldResult.body.transformNode;
		const	hitPoint = startPosition.add(castVector.scale(hitWorldResult.hitFraction));
		const	platformScript = this.getPlatformScript(transform);

		if (platformScript)
		{
			const	newVelocity = platformScript.getNewVelocity(velocity);

			return this.getNewPosition(hitPoint, newVelocity, newRemainingTime);
		}

		const	paddleScript = this.getPaddleScript(transform);

		if (paddleScript)
		{
			const	newVelocity = paddleScript.getNewVelocity(velocity);

			return this.getNewPosition(hitPoint, newVelocity, newRemainingTime);
		}
		throw new Error("The getNewPosition raycast hit an unexpected collider !");
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
