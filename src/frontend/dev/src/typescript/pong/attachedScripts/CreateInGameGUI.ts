import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { PauseGUI } from "../PauseGUI";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { type EndData, GameManager } from "@shared/attachedScripts/GameManager";
import { FrontendSceneData } from "../FrontendSceneData";
import { EndGUI } from "../EndGUI";
import { getFrontendSceneData } from "../PongGame";
import { InMatchmakingGUI } from "../InMatchmakingGUI";
import { zodThemeName } from "../menuStyles";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import type { ThemeName } from "../menuStyles";

export class CreateInGameGUI extends CustomScriptComponent {
	@Imported(InputManager) private _inputManager! : InputManager;
	@Imported(GameManager) private _gameManager! : GameManager;
	@Imported(zodThemeName) private _style! : ThemeName;

	private _pauseGUI! : PauseGUI;
	private _endGUI! : EndGUI;
	private _sceneData : FrontendSceneData;
	private _inMatchmakingGUI! : InMatchmakingGUI;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreatePauseGUI") {
        super(transform, scene, properties, alias);
		
		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected	awake()
	{
		this.createPauseGUI(this._style);
		this.createEndGUI(this._style);
		this.createInMatchmakingGUI(this._style);
	}

	protected	start()
	{
		this._inputManager.getEscapeInput().addKeyObserver((event : "keyDown" | "keyUp") => {
			if (event == "keyDown" && !this._gameManager.hasEnded())
				this.toggleMenu(this._pauseGUI);
		});

		this._sceneData.events.getObservable("end").add((endData : EndData) => { this.onGameEnd(endData) });
	}

	private	createPauseGUI(theme : ThemeName)
	{
		this._pauseGUI = new PauseGUI(theme);
		this._sceneData.pongHTMLElement.appendChild(this._pauseGUI);
		this.toggleMenu(this._pauseGUI);

		const	buttons = this._pauseGUI.getButtons()!;

		buttons.continue.addEventListener("click", () => { this.toggleMenu(this._pauseGUI) });
		buttons.forfeit.addEventListener("click", () => { this.onForfeit() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });
	}

	private	createEndGUI(theme : ThemeName)
	{
		this._endGUI = new EndGUI(theme);
		this._sceneData.pongHTMLElement.appendChild(this._endGUI);
		this.toggleMenu(this._endGUI);

		const	buttons = this._endGUI.getButtons()!;

		buttons.restart.addEventListener("click", () => { this.onRestart() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });
	}

	private	createInMatchmakingGUI(theme : ThemeName)
	{
		this._inMatchmakingGUI = new InMatchmakingGUI(theme);
		this._sceneData.pongHTMLElement.appendChild(this._inMatchmakingGUI);
		this._inMatchmakingGUI.classList.add("hidden");
		
		const	cancelButton = this._inMatchmakingGUI.getCancelButton()!;

		cancelButton.addEventListener("click", () => { this.cancelMatchmaking() });
	}

	private	onGameEnd(endData : EndData)
	{
		this.setMenuVisibility(this._pauseGUI, false);
		this.setMenuVisibility(this._endGUI, true);

		const	winText = `${(endData.winner === "draw") ? "Draw" : "Win"} ${endData.forfeit ? "By Forfeit" : ""}`;
		this._endGUI.setWinner(endData.winner, winText);
	}

	private	toggleMenu(menu : HTMLElement) : void
	{
		const	isMenuVisible = !menu.classList.toggle("hidden");

		if (isMenuVisible)
			this._gameManager.pause();
		else
			this._gameManager.unPause();
	}

	private	setMenuVisibility(menu : HTMLElement, visible : boolean)
	{
		const	isCurrentlyVisible = !menu.classList.contains("hidden");

		if (visible !== isCurrentlyVisible)
			this.toggleMenu(menu);
	}

	private	onForfeit()
	{
		if (this._sceneData.gameType === "Multiplayer" && this._sceneData.serverProxy)
		{
			const	opponentIndex = this._sceneData.serverProxy.getOpponentIndex();
			const	winningSide = (opponentIndex === 0) ? "left" : "right";

			this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
			this._sceneData.serverProxy.sendServerMessage("forfeit");
		}
		else if (this._sceneData.serverProxy)
			this._sceneData.events.getObservable("forfeit").notifyObservers("highestScore");
	}

	private	onRestart() : void
	{
		if (this._sceneData.gameType === "Multiplayer")
		{
			this._endGUI.classList.add("hidden");
			this._inMatchmakingGUI.classList.remove("hidden");
			this._sceneData.pongHTMLElement.restartOnlineGameAsync().then(() => {
				this._inMatchmakingGUI.classList.add("hidden");
			});
		}
		else
		{
			this._sceneData.events.getObservable("game-start").notifyObservers();
			this._endGUI.classList.add("hidden");
		}
	}

	private	cancelMatchmaking()
	{
		this._inMatchmakingGUI.classList.add("hidden");
		this._endGUI.classList.remove("hidden");
		this._sceneData.pongHTMLElement.cancelMatchmaking();
	}

	private	onGoToMenu() : void
	{
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
		if (this._inMatchmakingGUI)
			this._inMatchmakingGUI.remove();
	}
}

SceneManager.RegisterClass("CreateInGameGUI", CreateInGameGUI);
