import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { InputKey } from "../InputKey";
import { int } from "@babylonjs/core";

export class PlayerInput
{
	up: InputKey = new InputKey;
	down: InputKey = new InputKey;
}

export class InputManager extends ScriptComponent {
	private _playersInputs : PlayerInput[];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "InputManager") {
        super(transform, scene, properties, alias);
		this._playersInputs = Array.from({ length : 2}, () => new PlayerInput);
    }

	public getPlayerInput(playerIndex : int)
	{
		if (playerIndex > this._playersInputs.length)
			throw new Error("The player index is too big !");
		return this._playersInputs[playerIndex];
	}
}

SceneManager.RegisterClass("InputManager", InputManager);
