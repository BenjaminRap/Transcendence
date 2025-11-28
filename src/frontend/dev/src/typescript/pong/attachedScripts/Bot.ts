import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { getFrontendSceneData } from "../PongGame";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { PhysicsBody, Vector3 } from "@babylonjs/core";

export class Bot extends ScriptComponent {
	private static readonly _paddleMinimumMovement = 0.5;
	private static readonly _refreshIntervalMs = 1000;
	private	_inputManager! : TransformNode;
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;
	private _ball! : TransformNode & { physicsBody : PhysicsBody };

	private _inputs! : PlayerInput;
	private _updateInterval : number | undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Bot") {
        super(transform, scene, properties, alias);

		const	sceneData = getFrontendSceneData(this.scene);

		if (sceneData.gameType !== "Bot")
			SceneManager.DestroyScriptComponent(this);
		// sceneData.events.getObservable("game-start").add(() => {
		// 	this._updateInterval = window.setInterval(this.refreshGameView.bind(this), Bot._refreshIntervalMs);
		// });
    }

	protected	start()
	{
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this._inputs = inputManager.getPlayerInput(1);

		const	physicsBody = this._ball.getPhysicsBody();
		if (physicsBody == null)
			throw new Error("The ball doesn't have a physics body !");
		this._ball.physicsBody = physicsBody;
	}

	protected	update()
	{
		this.refreshGameView();
	}

	private	refreshGameView()
	{
		const	direction = this.getTargetDirection();

		this.setInput(direction);
	}

	private	getTargetDirection() : number
	{
		const	position = this.getTargetHeight();
		const	direction = position - this._paddleRight.position.y;

		if (Math.abs(direction) < Bot._paddleMinimumMovement)
			return 0;
		return direction;
	}

	private	getTargetHeight() : number
	{
		const	isBallHeadingOurGoal = Vector3.Dot(this._ball.physicsBody.getLinearVelocity(), Vector3.RightReadOnly) > 0;

		if (isBallHeadingOurGoal)
			return this._ball.position.y;
		else
			return 0;
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

	protected	destroy()
	{
		if (this._updateInterval)
			clearInterval(this._updateInterval);
	}
}

SceneManager.RegisterClass("Bot", Bot);
