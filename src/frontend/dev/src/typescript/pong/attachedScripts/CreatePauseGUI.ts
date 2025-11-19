import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PauseGUI } from "../pauseGUI";
import { FrontendSceneData } from "../FrontendSceneData";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { GameManager } from "@shared/attachedScripts/GameManager";

export class CreatePauseGUI extends ScriptComponent {
	private _type : "basic" | "colorful" = "basic";
	private _inputManager! : TransformNode;
	private _gameManager! : TransformNode & { script : GameManager };

	private _pauseGUI! : PauseGUI;
	private _sceneData : FrontendSceneData;
	private _defaultTimeStep : number;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreatePauseGUI") {
        super(transform, scene, properties, alias);

		const	sceneData = this.scene.metadata.sceneData;
		if (!(sceneData instanceof FrontendSceneData))
			throw new Error("The SceneData hasn't been attached to the scene !");
		this._sceneData = sceneData;
		this._defaultTimeStep = this._sceneData.havokPlugin.getTimeStep();
    }

	protected	awake()
	{
		const	sceneData = this.scene.metadata.sceneData;

		if (!(sceneData instanceof FrontendSceneData))
			throw new Error("The scene.metadata should have a sceneData variable of type FrontendSceneData !");
		const	pongHTMLElement = sceneData.pongHTMLElement;
		this._pauseGUI = new PauseGUI(this._type);

		pongHTMLElement.appendChild(this._pauseGUI);

		this._gameManager.script = SceneManager.GetComponent(this._gameManager, "GameManager", false);
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this.togglePauseMenu();
		inputManager.getEscapeInput().addOnKeyDownObserver(() => this.togglePauseMenu());

		const	buttons = this._pauseGUI.getButtons()!;

		buttons.continue.addEventListener("click", () => { this.togglePauseMenu() });
		buttons.restart.addEventListener("click", () => { this.onRestart() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });
	}

	private	togglePauseMenu() : void
	{
		if (this._pauseGUI.classList.toggle("hidden"))
			this._sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
		else
			this._sceneData.havokPlugin.setTimeStep(0);
	}

	private	onRestart() : void
	{
		this.togglePauseMenu();
		this._gameManager.script.restart();
	}

	private	onGoToMenu() : void
	{
		this._sceneData.pongHTMLElement.changeScene("Menu.gltf");
	}

	private	onQuit() : void
	{
		this._sceneData.pongHTMLElement.quit();
	}

	protected	destroy()
	{
		if (this._pauseGUI)
			this._pauseGUI.remove();
	}
}

SceneManager.RegisterClass("CreatePauseGUI", CreatePauseGUI);
