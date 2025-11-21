import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { PauseGUI } from "../pauseGUI";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { FrontendSceneData } from "../FrontendSceneData";
import { EndGUI } from "../endGUI";

export class CreateInGameGUI extends ScriptComponent {
	private _type : "basic" | "colorful" = "basic";
	private _inputManager! : TransformNode;
	private _gameManager! : TransformNode & { script : GameManager };

	private _pauseGUI! : PauseGUI;
	private _endGUI! : EndGUI;
	private _defaultTimeStep : number;
	private _sceneData : FrontendSceneData;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreatePauseGUI") {
        super(transform, scene, properties, alias);
		
		this._sceneData = this.scene.metadata.sceneData;
		this._defaultTimeStep = this._sceneData.havokPlugin.getTimeStep();
    }

	protected	awake()
	{
		this._gameManager.script = SceneManager.GetComponent(this._gameManager, "GameManager", false);

		this.createPauseGUI();
		this.createEndGUI();
	}

	private	createPauseGUI()
	{
		this._pauseGUI = new PauseGUI(this._type);
		this._sceneData.pongHTMLElement.appendChild(this._pauseGUI);
		this.toggleMenu(this._pauseGUI);

		const	inputManager = SceneManager.GetComponent<InputManager>(this._inputManager, "InputManager", false);

		inputManager.getEscapeInput().addKeyObserver((event : "keyDown" | "keyUp") => {
			if (event == "keyDown" && !this._gameManager.script.hasEnded())
				this.toggleMenu(this._pauseGUI)
		});

		const	buttons = this._pauseGUI.getButtons()!;

		buttons.continue.addEventListener("click", () => { this.toggleMenu(this._pauseGUI) });
		buttons.restart.addEventListener("click", () => { this.onRestart() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });

		this._sceneData.messageBus.OnMessage("end", () => { this.setMenuVisibility(this._pauseGUI, false) });
	}

	private	createEndGUI()
	{
		this._endGUI = new EndGUI(this._type);
		this._sceneData.pongHTMLElement.appendChild(this._endGUI);
		this.toggleMenu(this._endGUI);

		const	buttons = this._endGUI.getButtons()!;

		buttons.restart.addEventListener("click", () => { this.onRestart() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });

		this._sceneData.messageBus.OnMessage("end", () => { this.setMenuVisibility(this._endGUI, true) });
	}

	private	toggleMenu(menu : HTMLElement) : void
	{
		const	isMenuVisible = !menu.classList.toggle("hidden");
		const	isMultiplayerGame = this._sceneData.gameType === "Multiplayer"
		const	gamePaused = isMenuVisible && !isMultiplayerGame;

		if (gamePaused)
			this._sceneData.havokPlugin.setTimeStep(0);
		else
			this._sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
	}

	private	setMenuVisibility(menu : HTMLElement, visible : boolean)
	{
		const	isCurrentlyVisible = !menu.classList.contains("hidden");

		if (visible !== isCurrentlyVisible)
			this.toggleMenu(menu);
	}

	private	onRestart() : void
	{
		this._sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
		this._pauseGUI.classList.add("hidden");
		this._endGUI.classList.add("hidden");
		this._gameManager.script.restart();
	}

	private	onGoToMenu() : void
	{
		this._sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
		this._sceneData.pongHTMLElement.goToMenuScene();
	}

	private	onQuit() : void
	{
		this._sceneData.pongHTMLElement.quit();
	}

	protected	destroy()
	{
		if (this._pauseGUI)
			this._pauseGUI.remove();
		if (this._endGUI)
			this._endGUI.remove();
	}
}

SceneManager.RegisterClass("CreateInGameGUI", CreateInGameGUI);
