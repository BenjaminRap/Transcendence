import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { ServerSceneData } from "../ServerSceneData";
import { GameInfos, KeysUpdate } from "@shared/ServerMessage"
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { InputKey } from "@shared/InputKey";
import { SocketMessage } from "../Room";
import { int } from "@babylonjs/core/types";
import { Vector3 } from "@babylonjs/core";
import { getSceneData } from "../ServerPongGame";
import { TimerManager } from "@shared/attachedScripts/TimerManager";

export class ServerSync extends ScriptComponent {
	private static readonly	_sendInfoDelay = 100;

	private _ball! : TransformNode & { physicsBody : PhysicsBody };
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;
	private _inputManager! : TransformNode;
	private _timerManager! : TransformNode;

	private _sceneData : ServerSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ServerSync") {
        super(transform, scene, properties, alias);

		this._sceneData = getSceneData(this.scene);
    }

	protected	awake()
	{
		const	physicsBody = this._ball.getPhysicsBody();
		if (physicsBody == null)
			throw new Error("The ball doesn't have a physics body !");
		this._ball.physicsBody = physicsBody;
	}

	protected	start()
	{
		const	timerManager = SceneManager.GetComponent<TimerManager>(this._timerManager, "TimerManager", false);
		timerManager.setInterval(this.sendInfos.bind(this), ServerSync._sendInfoDelay);

		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);
		this.listenToClients(inputManager);
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
				paddleRightPos: this.getXYZ(this._paddleRight.position),
				paddleLeftPos: this.getXYZ(this._paddleLeft.position),
				ball: {
					pos: this.getXYZ(this._ball.position),
					linearVelocity: this.getXYZ(this._ball.physicsBody.getLinearVelocity())
				}
			}
		}
		this._sceneData.clientProxy.sendMessageToRoom("game-infos", message);
    }

	private	getXYZ(v : Vector3)
	{
		return { x: v.x, y: v.y, z: v.z };
	}

	private	listenToClients(inputManager : InputManager)
	{
		this._sceneData.clientProxy.onSocketMessage("input-infos").add((message : SocketMessage) => {
			const	inputs = inputManager.getPlayerInput(message.socketIndex);

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
