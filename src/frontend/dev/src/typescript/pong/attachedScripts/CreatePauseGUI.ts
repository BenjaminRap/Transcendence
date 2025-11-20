import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PauseGUI } from "../pauseGUI";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { FrontendSceneData } from "../FrontendSceneData";
import { SceneData } from "@shared/SceneData";

export class CreatePauseGUI extends ScriptComponent {
	private _type : "basic" | "colorful" = "basic";
	private _inputManager! : TransformNode;
	private _gameManager! : TransformNode & { script : GameManager };

	private _pauseGUI! : PauseGUI;
	private _defaultTimeStep : number;
	private _active : boolean = false;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreatePauseGUI") {
        super(transform, scene, properties, alias);
		
		const	sceneData = this.scene.metadata.sceneData;

		this._defaultTimeStep = sceneData.havokPlugin.getTimeStep();
    }

	protected	awake()
	{
		this._pauseGUI = new PauseGUI(this._type);

		const	sceneData = this.scene.metadata.sceneData;

		sceneData.pongHTMLElement.appendChild(this._pauseGUI);

		this._gameManager.script = SceneManager.GetComponent(this._gameManager, "GameManager", false);
		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		this.toggleMenu(sceneData);
		inputManager.getEscapeInput().addOnKeyDownObserver(() => {
			if (!this._gameManager.script.hasEnded())
				this.toggleMenu(sceneData)
		});

		const	buttons = this._pauseGUI.getButtons()!;

		buttons.continue.addEventListener("click", () => { this.toggleMenu(sceneData) });
		buttons.restart.addEventListener("click", () => { this.onRestart(sceneData) });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu(sceneData) });
		buttons.quit.addEventListener("click", () => { this.onQuit(sceneData) });

		sceneData.messageBus.OnMessage("end", () => {
			if (this._active)
				this.toggleMenu(sceneData);
		});
	}

	private	toggleMenu(sceneData : SceneData) : void
	{
		this._active = !this._pauseGUI.classList.toggle("hidden");
		if (this._active)
			sceneData.havokPlugin.setTimeStep(0);
		else
			sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
	}

	private	onRestart(sceneData : SceneData) : void
	{
		this.toggleMenu(sceneData);
		this._gameManager.script.restart();
	}

	private	onGoToMenu(sceneData : FrontendSceneData) : void
	{
		sceneData.pongHTMLElement.changeScene("Menu.gltf");
	}

	private	onQuit(sceneData : FrontendSceneData) : void
	{
		sceneData.pongHTMLElement.quit();
	}

	protected	destroy()
	{
		if (this._pauseGUI)
			this._pauseGUI.remove();
	}
}

SceneManager.RegisterClass("CreatePauseGUI", CreatePauseGUI);
