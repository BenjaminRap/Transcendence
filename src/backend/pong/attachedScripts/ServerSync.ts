import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { ServerSceneData } from "../ServerSceneData";
import type { GameInfos, KeysUpdate } from "@shared/ServerMessage";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { InputKey } from "@shared/InputKey";
import type { SocketMessage } from "../Room";
import type { int } from "@babylonjs/core/types";
import { Vector3 } from "@babylonjs/core";
import { getSceneData } from "../ServerPongGame";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { Paddle } from "@shared/attachedScripts/Paddle";
import { Imported } from "@shared/ImportedDecorator";
import { Ball } from "@shared/attachedScripts/Ball";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class ServerSync extends CustomScriptComponent {
	private static readonly	_sendInfoDelay = 100;

	@Imported("Ball") private _ball! : Ball;
	@Imported("Paddle") private _paddleRight! : Paddle;
	@Imported("Paddle") private _paddleLeft! : Paddle;
	@Imported("InputManager") private _inputManager! : InputManager;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _sceneData : ServerSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ServerSync") {
        super(transform, scene, properties, alias);

		this._sceneData = getSceneData(this.scene);
    }


	protected	start()
	{
		this._timerManager.setInterval(this.sendInfos.bind(this), ServerSync._sendInfoDelay);

		this.listenToClients();
		this._sceneData.events.getObservable("updateLeftScore").add(() => { this.notifyGoal("left") });
		this._sceneData.events.getObservable("updateRightScore").add(() => { this.notifyGoal("right") });
	}

	private	notifyGoal(side : "left" | "right")
	{
		const	message : GameInfos = {
			type: "goal",
			infos: {
				side: side
			}
		}
		this._sceneData.clientProxy.sendMessageToRoom("game-infos", message);
	}

    private sendInfos(): void {
		const	message : GameInfos = {
			type : "itemsUpdate",
			infos: {
				paddleRightPos: this.getXYZ(this._paddleRight.transform.position),
				paddleLeftPos: this.getXYZ(this._paddleLeft.transform.position),
				ball: {
					pos: this.getXYZ(this._ball.transform.position),
					linearVelocity: this.getXYZ(this._ball.getPhysicsBody().getLinearVelocity())
				}
			}
		}
		this._sceneData.clientProxy.sendMessageToRoom("game-infos", message);
    }

	private	getXYZ(v : Vector3)
	{
		return { x: v.x, y: v.y, z: v.z };
	}

	private	listenToClients()
	{
		this._sceneData.clientProxy.onSocketMessage("input-infos").add((message : SocketMessage) => {
			const	inputs = this._inputManager.getPlayerInput(message.socketIndex);

			this.onKeyUpdate(message.data, inputs, message.socketIndex);
		});
	}

	private	onKeyUpdate(keysUpdate : KeysUpdate, playerInputs : PlayerInput, socketIndex : int)
	{
		const	gameInfos : GameInfos = {
			type: "input",
			infos: keysUpdate
		};

		this._sceneData.clientProxy.broadcastMessageFromSocket(socketIndex, "game-infos", gameInfos);
		this.updateKey(keysUpdate.up, playerInputs.up);
		this.updateKey(keysUpdate.down, playerInputs.down);
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

SceneManager.RegisterClass("ServerSync", ServerSync);
