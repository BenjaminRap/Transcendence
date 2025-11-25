import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { GameInfos } from "@shared/ServerMessage";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { InputKey } from "@shared/InputKey";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getFrontendSceneData } from "../PongGame";

export class ClientSync extends ScriptComponent {
	private	_inputManager! : TransformNode;
	private	_gameManager! : TransformNode;
	private _ball! : TransformNode;
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;

	private _sceneData : FrontendSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ClientSync") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected	awake()
	{
		if (this._sceneData.gameType !== "Multiplayer")
			return ;
		const	gameManager = SceneManager.GetComponent<GameManager>(this._gameManager, "GameManager", false);
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this.listenToGameInfos(gameManager, inputManager);
	}

	protected	ready()
	{
		this._sceneData.serverProxy?.sendServerMessage("ready");
	}
	
	private	listenToGameInfos(gameManager : GameManager, inputManager : InputManager)
	{
		const	serverProxy = this._sceneData.serverProxy;
	
		if (!serverProxy)
			return ;
		serverProxy.onServerMessage()!.add((gameInfos : GameInfos | "room-closed" | "server-error" | "forfeit") => {
			if (gameInfos === "room-closed" || gameInfos === "server-error")
				return ;
			if (gameInfos === "forfeit")
			{
				const	winningSide = (serverProxy.opponentIndex === 0) ? "left" : "right";

				this._sceneData.messageBus.PostMessage("forfeit", winningSide);
			}
			else if (gameInfos.type === "input")
			{
				const	opponentInputs = inputManager.getPlayerInput(serverProxy.opponentIndex);

				this.updateKey(gameInfos.infos.up, opponentInputs.up);
				this.updateKey(gameInfos.infos.down, opponentInputs.down);
			}
			else if (gameInfos.type === "itemsUpdate")
			{
				this._ball.position.copyFrom(this.xyzToVector3(gameInfos.infos.ball.pos));
				this._ball.getPhysicsBody()!.setLinearVelocity(this.xyzToVector3(gameInfos.infos.ball.linearVelocity));
				this._paddleLeft.position.copyFrom(this.xyzToVector3(gameInfos.infos.paddleLeftPos));
				this._paddleRight.position.copyFrom(this.xyzToVector3(gameInfos.infos.paddleRightPos));
			}
			else if (gameInfos.type === "goal")
				gameManager.onGoal(gameInfos.infos.side);
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
}

SceneManager.RegisterClass("ClientSync", ClientSync);
