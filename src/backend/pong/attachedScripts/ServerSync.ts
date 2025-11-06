import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { ServerSceneData } from "../ServerSceneData";
import { GameInfos } from "@shared/ServerMessage"

export class ServerSync extends ScriptComponent {
	private static readonly	_sendInfoDelay = 100;

	private _ball! : TransformNode & { physicsBody : PhysicsBody };
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;

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
		this._sceneData.firstSocket.emit("game-infos", message);
		this._sceneData.secondSocket.emit("game-infos", message);
    }

	protected	destroy()
	{
		if (this._sendInfosInterval)
			clearInterval(this._sendInfosInterval);
	}
}

SceneManager.RegisterClass("ServerSync", ServerSync);
