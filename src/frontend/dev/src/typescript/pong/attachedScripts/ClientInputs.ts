import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { InputKey } from "@shared/InputKey";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core";
import { ClientInput, FrontendSceneData } from "../FrontendSceneData";

export class ClientInputs extends ScriptComponent {
	private _inputManager! : TransformNode;
	
	private _inputsMap : Map<string, InputKey> = new Map<string, InputKey>;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ClientInputs") {
        super(transform, scene, properties, alias);
    }

	protected start()
	{
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);
		const	sceneData : FrontendSceneData = this.scene.metadata.sceneData;
		const	inputs = sceneData.inputs;

		inputs.forEach((clientInput : ClientInput) => {
			const	playerInput = inputManager.getPlayerInput(clientInput.index);

			this._inputsMap.set(clientInput.upKey, playerInput.up);
			this._inputsMap.set(clientInput.downKey, playerInput.down);
		});
		this._inputsMap.set("Escape", inputManager.getEscapeInput());
		this.scene.onKeyboardObservable.add(this.onKeyboardInput.bind(this));
	}

	private onKeyboardInput(info : KeyboardInfo)
	{
		const	keyPressed : InputKey | undefined = this._inputsMap.get(info.event.key);

		if (keyPressed == undefined)
			return ;
		if (info.type == KeyboardEventTypes.KEYDOWN)
			keyPressed.setKeyDown();
		else
			keyPressed.setKeyUp();
	}
}

SceneManager.RegisterClass("ClientInputs", ClientInputs);
