import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { InputKey } from "../InputKey";
import type { int } from "@babylonjs/core";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class PlayerInput
{
	up: InputKey = new InputKey();
	down: InputKey = new InputKey();
}

export class InputManager extends CustomScriptComponent {
	private _playersInputs : PlayerInput[];
	private _escapeInput : InputKey;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "InputManager") {
        super(transform, scene, properties, alias);
		this._escapeInput = new InputKey();
		this._playersInputs = Array.from({ length : 2}, () => new PlayerInput);
    }

	public getPlayerInput(playerIndex : int) : PlayerInput
	{
		if (playerIndex > this._playersInputs.length)
			throw new Error("The player index is too big !");
		return this._playersInputs[playerIndex];
	}

	public getEscapeInput() : InputKey
	{
		return this._escapeInput;
	}
}

SceneManager.RegisterClass("InputManager", InputManager);
