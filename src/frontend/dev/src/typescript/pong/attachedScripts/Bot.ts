import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { getFrontendSceneData } from "../PongGame";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { Epsilon } from "@babylonjs/core";

export class Bot extends ScriptComponent {
	private static readonly _paddleMinimumMovement = 0.5;
	private	_inputManager! : TransformNode;
	private _paddleRight! : TransformNode;
	private _paddleLeft! : TransformNode;
	private _ball! : TransformNode;

	private _inputs! : PlayerInput;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Bot") {
        super(transform, scene, properties, alias);

		const	sceneData = getFrontendSceneData(this.scene);

		if (sceneData.gameType !== "Bot")
			SceneManager.DestroyScriptComponent(this);
    }

	protected	start()
	{
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this._inputs = inputManager.getPlayerInput(1);
	}

	protected	update()
	{
		const	direction = this.getPaddleDirection();

		this.setInput(direction);
	}

	private	getPaddleDirection() : number
	{
		const	direction = this._ball.position.y - this._paddleRight.position.y;

		if (Math.abs(direction) < Bot._paddleMinimumMovement)
			return 0;
		return direction;
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
