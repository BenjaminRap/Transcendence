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
import { initMenu } from "../gui/IGUI";
import { TournamentGUI } from "../gui/TournamentGUI";

export class CreateInGameGUI extends CustomScriptComponent {
	@Imported("InputManager") private _inputManager! : InputManager;
	@Imported("GameManager") private _gameManager! : GameManager;
	@Imported(zodThemeName) private _theme! : ThemeName;

	private _pauseGUI! : PauseGUI;
	private _endGUI! : EndGUI;
	private _inMatchmakingGUI! : InMatchmakingGUI;
	private _tournamentWinnerGUI! : TournamentWinnerGUI;
	private _matchOpponentsGUI! : MatchOpponentsGUI;
	private _tournamentGUI? : TournamentGUI;

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

		this.createMenus();
	}

	protected	createMenus()
	{
		const	forfeitEnabled = this._sceneData.tournament === undefined || this._sceneData.gameType === "Multiplayer";
		const	isOnline = this._sceneData.gameType === "Multiplayer";
		const	isTournament = this._sceneData.tournament !== undefined;

		this._pauseGUI = initMenu(new PauseGUI(forfeitEnabled), {
			continue: () => this.togglePause(),
			forfeit: () => this.onForfeit(),
			goToMenu: () => this.onGoToMenu()
		}, this._menuParent);
		this._endGUI = initMenu(new EndGUI(isOnline, isTournament), {
			restart: () => this.onRestart(),
			continue: () => this._sceneData.tournament?.startNextGame(),
			goToMenu: () => this.onGoToMenu()

		}, this._menuParent);
		this._inMatchmakingGUI = initMenu(new InMatchmakingGUI(), {
			cancelButton: () => this.leaveMatchmaking(),
		}, this._menuParent);
		this._tournamentWinnerGUI = initMenu(new TournamentWinnerGUI(), {
			goToMenu: () => this.onGoToMenu()
		}, this._menuParent);
		this._matchOpponentsGUI = initMenu(new MatchOpponentsGUI(), undefined, this._menuParent);
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
		this._sceneData.events.getObservable("tournament-end").add((winner) => { 
			this._tournamentWinnerGUI.setWinner(winner);
			this.switchToGUI(this._tournamentWinnerGUI);
		});
		this._sceneData.events.getObservable("input-change").add(clientInputs => {
			this._matchOpponentsGUI.setInputs(clientInputs);
		});
		this._sceneData.events.getObservable("show-tournament").add(() => {
			if (!this._tournamentGUI)
				return ;
			this.switchToGUI(this._tournamentGUI);
		});
		this._sceneData.events.getObservable("tournament-gui-create").add((participants) => {
			if (this._tournamentGUI)
				return ;
			this._tournamentGUI = initMenu(new TournamentGUI(participants), undefined, this._menuParent);
		});
		this._sceneData.events.getObservable("tournament-gui-set-winners").add(([round, winners]) => {
			this._tournamentGUI?.setWinners(round, winners);
		});
	}

	private	onGameEnd(endData : EndData)
	{
		this._endGUI.setWinner(endData.winner, endData.forfeit, this._sceneData.serverProxy.getPlayerIndex());
		this.switchToGUI(this._endGUI);
		this._sceneData.tournament?.setMatchWinner(endData);
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
		if (this._sceneData.gameType === "Multiplayer")
		{
			const	opponentIndex = this._sceneData.serverProxy.getOpponentIndex();
			const	winningSide = (opponentIndex === 0) ? "left" : "right";

			this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
			this._sceneData.serverProxy.forfeit();;
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
			this._sceneData.pongHTMLElement.startOnlineGame().then(() => {
				this._inMatchmakingGUI.classList.add("hidden");
			});
		}
		else
		{
			this._sceneData.events.getObservable("game-start").notifyObservers();
			this._endGUI.classList.add("hidden");
		}
	}

	private	leaveMatchmaking()
	{
		this._inMatchmakingGUI.classList.add("hidden");
		this._endGUI.classList.remove("hidden");
		this._sceneData.serverProxy.leaveMatchmaking();
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

	private	onGoToMenu() : void
	{
		this._sceneData.pongHTMLElement.goToMenuScene();
	}

	protected	destroy()
	{
		this._menuParent.remove();
	}
}

SceneManager.RegisterClass("CreateInGameGUI", CreateInGameGUI);
