import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { PauseGUI } from "../gui/PauseGUI";
import { InputManager } from "@shared/attachedScripts/InputManager";
import { type EndData, GameManager } from "@shared/attachedScripts/GameManager";
import { FrontendSceneData } from "../FrontendSceneData";
import { EndGUI } from "../gui/EndGUI";
import { getFrontendSceneData } from "../PongGame";
import { InMatchmakingGUI } from "../gui/InMatchmakingGUI";
import { applyTheme, zodThemeName } from "../menuStyles";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import type { ThemeName } from "../menuStyles";
import { MatchOpponentsGUI } from "../gui/MatchOpponentsGUI";
import { TournamentWinnerGUI } from "../gui/TournamentWinnerGUI";

export class CreateInGameGUI extends CustomScriptComponent {
	@Imported("InputManager") private _inputManager! : InputManager;
	@Imported("GameManager") private _gameManager! : GameManager;
	@Imported(zodThemeName) private _theme! : ThemeName;

	private _pauseGUI! : PauseGUI;
	private _endGUI! : EndGUI;
	private _inMatchmakingGUI! : InMatchmakingGUI;
	private _tournamentWinnerGUI! : TournamentWinnerGUI;
	private _matchOpponentsGUI! : MatchOpponentsGUI;

	private _sceneData : FrontendSceneData;
	private _currentGUI? : HTMLElement;
	private _menuParent! : HTMLDivElement;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreatePauseGUI") {
        super(transform, scene, properties, alias);
		
		this._sceneData = getFrontendSceneData(this.scene);
		this._menuParent = document.createElement("div");
		this._menuParent.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this._sceneData.pongHTMLElement.appendChild(this._menuParent);
    }

	protected	awake()
	{
		applyTheme(this._sceneData.pongHTMLElement, this._theme);
		this.createPauseGUI();
		this.createEndGUI();
		this.createInMatchmakingGUI();
		this.createTournamentWinnerGUI();
		this.createMatchOpponentsGUI();
	}

	protected	start()
	{
		this._inputManager.getEscapeInput().addKeyObserver((event : "keyDown" | "keyUp") => {
			if (event == "keyDown" && !this._gameManager.hasEnded())
				this.togglePause();
		});
		this._sceneData.events.getObservable("end").add((endData : EndData) => { this.onGameEnd(endData) });
		this._sceneData.events.getObservable("set-participants").add(([profileLeft, profileRight]) => {
			this._matchOpponentsGUI.setOpponents(profileLeft, profileRight);
			this.switchToGUI(this._matchOpponentsGUI);
		});
		this._sceneData.events.getObservable("game-start").add(() => {
			this._sceneData.pongHTMLElement.focusOnCanvas();
			this.hideCurrentGUI()
		});
		this._sceneData.events.getObservable("game-unpaused").add(() => {
			this._sceneData.pongHTMLElement.focusOnCanvas();
		})
		this._sceneData.events.getObservable("show-tournament").add((tournamentGUI) => {
			if (tournamentGUI.parentNode === null)
				this._menuParent.appendChild(tournamentGUI);
			this.switchToGUI(tournamentGUI)
		});
		this._sceneData.events.getObservable("tournament-end").add((winner) => { 
			this._tournamentWinnerGUI.setWinner(winner);
			this.switchToGUI(this._tournamentWinnerGUI);
		});
	}

	private	createPauseGUI()
	{
		const	forfeitEnabled = this._sceneData.tournament === undefined || this._sceneData.gameType === "Multiplayer";
		this._pauseGUI = new PauseGUI(forfeitEnabled);
		this.addHiddenGUI(this._pauseGUI);

		const	buttons = this._pauseGUI.getButtons()!;

		buttons.continue.addEventListener("click", () => { this.togglePause(); });
		buttons.forfeit?.addEventListener("click", () => { this.onForfeit() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });
	}

	private	createEndGUI()
	{
		this._endGUI = new EndGUI();
		this.addHiddenGUI(this._endGUI);

		const	buttons = this._endGUI.getButtons()!;

		buttons.restart.addEventListener("click", () => { this.onRestart() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });
	}

	private	createInMatchmakingGUI()
	{
		this._inMatchmakingGUI = new InMatchmakingGUI();
		this.addHiddenGUI(this._inMatchmakingGUI);
		
		const	cancelButton = this._inMatchmakingGUI.getCancelButton()!;

		cancelButton.addEventListener("click", () => { this.cancelMatchmaking() });
	}

	private	createTournamentWinnerGUI()
	{
		this._tournamentWinnerGUI = new TournamentWinnerGUI();

		this.addHiddenGUI(this._tournamentWinnerGUI);

		const	buttons = this._tournamentWinnerGUI.getButtons()!;

		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu() });
		buttons.quit.addEventListener("click", () => { this.onQuit() });
	}

	private	createMatchOpponentsGUI()
	{
		this._matchOpponentsGUI = new MatchOpponentsGUI();

		this.addHiddenGUI(this._matchOpponentsGUI);
	}

	private	onGameEnd(endData : EndData)
	{
		if (this._sceneData.tournament !== undefined)
			this._sceneData.tournament.onGameEnd(endData);
		else
		{
			const	winText = `${(endData.winner === "draw") ? "Draw" : "Win"} ${endData.forfeit ? "By Forfeit" : ""}`;

			this._endGUI.setWinner(endData.winner, winText);
			this.switchToGUI(this._endGUI);
		}
	}

	private	togglePause() : void
	{
		if (this._currentGUI === this._pauseGUI)
		{
			this._gameManager.unPause();
			this.hideCurrentGUI();
		}
		else
		{
			this.switchToGUI(this._pauseGUI);
			this._gameManager.pause();
		}
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
		else
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

	private	switchToGUI(newGUI : HTMLElement)
	{
		this.hideCurrentGUI();
		this._currentGUI = newGUI;
		newGUI.classList.remove("hidden");
		newGUI.focus();
	}

	private	hideCurrentGUI()
	{
		this._currentGUI?.classList.add("hidden");
		this._currentGUI = undefined;
	}

	private	addHiddenGUI(menu : HTMLElement)
	{
		this._menuParent.appendChild(menu);
		menu.classList.add("hidden");
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
		this._menuParent.remove();
	}
}

SceneManager.RegisterClass("CreateInGameGUI", CreateInGameGUI);
