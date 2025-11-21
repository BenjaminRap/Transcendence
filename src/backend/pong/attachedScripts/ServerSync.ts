import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { ServerSceneData } from "../ServerSceneData";
import { GameInfos, KeysUpdate } from "@shared/ServerMessage"
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { InputKey } from "@shared/InputKey";
import { ClientMessage } from "../Room";

export class ServerSync extends ScriptComponent {
	private static readonly	_sendInfoDelay = 100;

	private _ball! : TransformNode & { physicsBody : PhysicsBody };
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;
	private _inputManager! : TransformNode;

	private _sceneData : ServerSceneData;
	private _sendInfosInterval? : NodeJS.Timeout;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ServerSync") {
        super(transform, scene, properties, alias);

		const	sceneData = this.scene.metadata.sceneData;
		if (!(sceneData instanceof ServerSceneData))
			throw new Error("The SceneData hasn't been attached to the scene !");
		this._sceneData = sceneData;
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
		this._sendInfosInterval = setInterval(this.sendInfos.bind(this), ServerSync._sendInfoDelay);

		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);
		this.listenToClients(inputManager);
		this._sceneData.messageBus.OnMessage("updateLeftScore", () => { this.notifyGoal("right") });
		this._sceneData.messageBus.OnMessage("updateRightScore", () => { this.notifyGoal("left") });
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
				paddleRightPos: this._paddleRight.position,
				paddleLeftPos: this._paddleLeft.position,
				ball: {
					pos: this._ball.position,
					linearVelocity: this._ball.physicsBody.getLinearVelocity()
				}
			}
		}
		this._sceneData.clientProxy.sendMessageToRoom("game-infos", message);
    }

	private	listenToClients(inputManager : InputManager)
	{
		const	firstSocketInputs = inputManager.getPlayerInput(0);
		const	secondSocketInputs = inputManager.getPlayerInput(1);

		this._sceneData.clientProxy.onSocketMessage("input-infos").add((message : ClientMessage) => {
			if (message.socket === "first")
				this.onKeyUpdate(message.data, firstSocketInputs, "second");
			else
				this.onKeyUpdate(message.data, secondSocketInputs, "first");
		});
	}

	private	onKeyUpdate(keysUpdate : KeysUpdate, playerInputs : PlayerInput, opponentSocket : "first" | "second")
	{
		const	gameInfos : GameInfos = {
			type: "input",
			infos: keysUpdate
		};
		this._sceneData.clientProxy.sendMessageToSocket(opponentSocket, "game-infos", gameInfos);
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

	protected	destroy()
	{
		if (this._sendInfosInterval)
			clearInterval(this._sendInfosInterval);
	}
}

SceneManager.RegisterClass("ServerSync", ServerSync);
