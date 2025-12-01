import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { InputKey, type InputKeyCallback } from "@shared/InputKey";
import { InputManager, PlayerInput } from "@shared/attachedScripts/InputManager";
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core";
import { type ClientInput, FrontendSceneData } from "../FrontendSceneData";
import { getFrontendSceneData } from "../PongGame";
import { Imported } from "@shared/ImportedDecorator";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class ClientInputs extends CustomScriptComponent {
	@Imported(InputManager) private _inputManager! : InputManager;
	
	private _inputsMap : Map<string, InputKey> = new Map<string, InputKey>;
	private _mainPlayerInput : PlayerInput | null = null;
	private _upCallback : InputKeyCallback | null = null;
	private _downCallback : InputKeyCallback | null = null;
	private _sceneData : FrontendSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ClientInputs") {
        super(transform, scene, properties, alias);

		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected start()
	{
		this.setInputsListener();
		this.setMultiplayerEvents();
		this.scene.onKeyboardObservable.add(this.onKeyboardInput.bind(this));
		this._sceneData.events.getObservable("input-change").add(() => {
			this.clear();
			this.setInputsListener();
			this.setMultiplayerEvents();
		})
	}

	private	setMultiplayerEvents()
	{
		const	serverProxy = this._sceneData.serverProxy;

		if (this._sceneData.gameType !== "Multiplayer" || !serverProxy)
			return ;

		this._mainPlayerInput = this._inputManager.getPlayerInput(serverProxy.getPlayerIndex()!);
		this._upCallback = (event : "keyDown" | "keyUp") => {
			serverProxy!.keyUpdate("up", event);
		};
		this._downCallback = (event : "keyDown" | "keyUp") => {
			serverProxy!.keyUpdate("down", event);
		};
		this._mainPlayerInput.up.addKeyObserver(this._upCallback);
		this._mainPlayerInput.down.addKeyObserver(this._downCallback);
	}

	private	setInputsListener()
	{
		this._sceneData.inputs.forEach((clientInput : ClientInput) => {
			const	playerInput = this._inputManager.getPlayerInput(clientInput.index);

			this._inputsMap.set(clientInput.upKey, playerInput.up);
			this._inputsMap.set(clientInput.downKey, playerInput.down);
		});
		this._inputsMap.set("Escape", this._inputManager.getEscapeInput());
	}

	private	clear()
	{
		if (this._upCallback)
			this._mainPlayerInput?.up.removeKeyObserver(this._upCallback);
		if (this._downCallback)
			this._mainPlayerInput?.down.removeKeyObserver(this._downCallback);
		this._inputsMap.forEach((value : InputKey) => { value.setKeyUp() })
		this._inputsMap.clear();
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
