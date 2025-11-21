import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { GameInfos } from "@shared/ServerMessage";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { InputKey } from "@shared/InputKey";
import { InputManager } from "@shared/attachedScripts/InputManager";

export class ClientSync extends ScriptComponent {
	private	_inputManager! : TransformNode;
	private	_gameManager! : TransformNode;
	private _ball! : TransformNode;
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ClientSync") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	sceneData : FrontendSceneData = this.scene.metadata.sceneData;

		if (sceneData.gameType !== "Multiplayer")
			return ;
		const	gameManager = SceneManager.GetComponent<GameManager>(this._gameManager, "GameManager", false);
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this.listenToGameInfos(sceneData, gameManager, inputManager);
	}
	
	private	listenToGameInfos(sceneData : FrontendSceneData, gameManager : GameManager, inputManager : InputManager)
	{
		const	opponentsIndex = (sceneData.serverCommunicationHandler!.playerIndex === 0) ? 1 : 0;
		console.log(opponentsIndex);
		const	opponentInputs = inputManager.getPlayerInput(opponentsIndex);
		sceneData.serverCommunicationHandler!.onServerMessage()!.add((gameInfos : GameInfos | "room-closed") => {
			if (gameInfos === "room-closed")
				return ;
			if (gameInfos.type === "input")
			{
				this.updateKey(gameInfos.infos.up, opponentInputs.up);
				this.updateKey(gameInfos.infos.down, opponentInputs.down);
			}
			else if (gameInfos.type === "itemsUpdate")
			{
				this._ball.position.copyFrom(gameInfos.infos.ball.pos);
				this._ball.getPhysicsBody()!.setLinearVelocity(gameInfos.infos.ball.linearVelocity);
				this._paddleLeft.position.copyFrom(gameInfos.infos.paddleLeftPos);
				this._paddleRight.position.copyFrom(gameInfos.infos.paddleRightPos);
			}
			else
				gameManager.onGoal(gameInfos.infos.side);
		});
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
}

SceneManager.RegisterClass("ClientSync", ClientSync);
