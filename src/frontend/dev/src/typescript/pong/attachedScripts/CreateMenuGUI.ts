import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI, type SwitchButton } from "../gui/MenuGUI";
import { Animation, EasingFunction, type Nullable, SineEase } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { SceneMenuData } from "./SceneMenuData";
import { InMatchmakingGUI } from "../gui/InMatchmakingGUI";
import { getFrontendSceneData } from "../PongGame";
import { applyTheme } from "../menuStyles";
import { TitleGUI } from "../gui/TitleGUI";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { GameTypeChoiceGUI } from "../gui/GameTypeChoiceGUI";
import { LocalTournamentCreationGUI } from "../gui/LocalTournamentCreationGUI";
import { LocalTournament } from "../LocalTournament";
import { initMenu } from "../gui/IGUI";
import { OnlineTournamentCreationGUI } from "../gui/OnlineTournamentCreationGUI";
import { OnlineTournamentJoinPrivateGUI } from "../gui/OnlineTournamentJoinPrivateGUI";
import { OnlineTournamentJoinPublicGUI } from "../gui/OnlineTournamentJoinPublicGUI";
import { OnlineTournamentChoiceGUI } from "../gui/OnlineTournamentChoiceGUI";
import { OnlineTournamentStartGUI } from "../gui/OnlineTournamentStartGUI";
import { PongError } from "@shared/pongError/PongError";
import type { FrontendGameSceneName } from "@shared/SceneData";
import type { TournamentEvent } from "@shared/ZodMessageType";
import { BotDifficultyChoiceGUI } from "../gui/BotDifficultyChoiceGUI";
import type { BotDifficulty } from "../BotDifficulty";

const enemyTypes = ["Local", "Multiplayer", "Bot"] as const;

export class CreateMenuGUI extends CustomScriptComponent {
	@Imported(TransformNode) private _scenesParent! : TransformNode;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _scenes! : SceneMenuData[];
	private _animation : Nullable<Animatable> = null;
	private _easeFunction = new SineEase();
	private _sceneData : FrontendSceneData;
	private _menuGUI! : MenuGUI;
	private _inMatchmakingGUI! : InMatchmakingGUI;
	private _titleGUI! : TitleGUI;
	private _botDifficultyChoiceGUI! : BotDifficultyChoiceGUI;
	private _localGameTypeChoiceGUI! : GameTypeChoiceGUI;
	private _localTournamentCreationGUI!: LocalTournamentCreationGUI;
	private _onlineGameTypeChoiceGUI! : GameTypeChoiceGUI;
	private _onlineTournamentChoiceGUI! : OnlineTournamentChoiceGUI;
	private _onlineTournamentCreationGUI! : OnlineTournamentCreationGUI;
	private _onlineTournamentStartGUI! : OnlineTournamentStartGUI;
	private _onlineTournamentJoinPrivateGUI! : OnlineTournamentJoinPrivateGUI;
	private _onlineTournamentJoinPublicGUI! : OnlineTournamentJoinPublicGUI;
	private _currentSceneFileName! : FrontendGameSceneName;
	private _menuParent! : HTMLDivElement;
	private _currentMenu : HTMLElement | null = null;
	private _statesGUI! : Map<string, HTMLElement>; 

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
		this._easeFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
		this._sceneData = getFrontendSceneData(this.scene);
		this._menuParent = document.createElement("div");
		this._menuParent.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this._sceneData.pongHTMLElement.appendChild(this._menuParent);
    }

	protected	awake()
	{
		this.setScenes();
		if (this._scenes.length === 0)
			throw new PongError("There is no scene in the menu !", "quitScene");
		this._currentSceneFileName = this._scenes[0].getSceneFileName();
		const	theme = this._scenes[0].getTheme();

		applyTheme(this._sceneData.pongHTMLElement, theme)
		this.createMenus();
		this.createStatesGuiMap();
		this._sceneData.events.getObservable("tournament-event").add(tournamentEvent => this.onTournamentEvent(tournamentEvent));
	}

	private	createMenus()
	{
		window.addEventListener("popstate", this.onPopState);
		this.createMenuGUI();

		this._titleGUI = initMenu(new TitleGUI(), undefined, this._menuParent);
		this._inMatchmakingGUI = initMenu(new InMatchmakingGUI(), {
			cancelButton: () => history.back()
		}, this._menuParent);
		this._botDifficultyChoiceGUI = initMenu(new BotDifficultyChoiceGUI(), {
			easy: () => this.startBotGame(this._currentSceneFileName,"easy"),
			normal: () => this.startBotGame(this._currentSceneFileName, "normal"),
			hard: () => this.startBotGame(this._currentSceneFileName, "hard"),
			cancel: () => history.back()
		}, this._menuParent);
		this._localGameTypeChoiceGUI = initMenu(new GameTypeChoiceGUI(), {
			oneVersusOne: () => this.startLocalGame(this._currentSceneFileName),
			tournament: () => {
				this._localTournamentCreationGUI.reset();
				this.switchMenu(this._localTournamentCreationGUI)
			},
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineGameTypeChoiceGUI = initMenu(new GameTypeChoiceGUI(), {
			oneVersusOne: () => this.startOnlineGame(this._currentSceneFileName),
			tournament: () => this.switchMenu(this._onlineTournamentChoiceGUI),
			cancel: () => history.back()
		}, this._menuParent)
		this._localTournamentCreationGUI = initMenu(new LocalTournamentCreationGUI(), {
			start: () => this.startLocalTournamentGame(),
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineTournamentChoiceGUI = initMenu(new OnlineTournamentChoiceGUI(), {
			create: () => {
				this._onlineTournamentCreationGUI.reset();
				this.switchMenu(this._onlineTournamentCreationGUI)
			},
			joinPublic: () => {
				this._onlineTournamentJoinPublicGUI.reset();
				this.refreshTournaments();
				this.switchMenu(this._onlineTournamentJoinPublicGUI);
			},
			joinPrivate: () => {
				this._onlineTournamentJoinPrivateGUI.reset();
				this.switchMenu(this._onlineTournamentJoinPrivateGUI)
			},
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineTournamentCreationGUI = initMenu(new OnlineTournamentCreationGUI(), {
			create: () => this.createTournament(),
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineTournamentStartGUI = initMenu(new OnlineTournamentStartGUI(), {
			start: () => this.startTournament(),
			join: () => this.joinTournamentAsCreator(),
			leave: () => this.leaveTournament(),
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineTournamentJoinPrivateGUI = initMenu(new OnlineTournamentJoinPrivateGUI(), {
			join: () => this.joinTournament(this._onlineTournamentJoinPrivateGUI.getTournamentId()),
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineTournamentJoinPublicGUI = initMenu(new OnlineTournamentJoinPublicGUI(), {
			refresh: () => this.refreshTournaments(),
			cancel: () => history.back()
		}, this._menuParent);
		this._onlineTournamentJoinPublicGUI.onTournamentJoin().add((id : string) => {
			this.joinTournament(id);
		});
		this._onlineTournamentStartGUI.onBanParticipant().add((name : string) => {
			this._sceneData.serverProxy.banPlayerFromTournament(name);
		});
		this._onlineTournamentStartGUI.onKickParticipant().add((name : string) => {
			this._sceneData.serverProxy.kickPlayerFromTournament(name);
		});
		this._onlineTournamentStartGUI.onSetAlias().add(value => {
			this.setAlias(value.guestName, value.newAlias);
		});
	}

	private	createStatesGuiMap()
	{
		this._statesGUI = new Map<string, HTMLElement>([
			["", this._menuGUI],
			["botDifficultyChoice", this._botDifficultyChoiceGUI],
			["localGameTypeChoice", this._localGameTypeChoiceGUI],
			["localTournamentCreation", this._localTournamentCreationGUI],
			["onlineTournamentCreation", this._onlineTournamentCreationGUI],
			["onlineGameTypeChoice", this._onlineGameTypeChoiceGUI],
			["onlineTournamentChoice", this._onlineTournamentChoiceGUI],
			["onlineTournamentStart", this._onlineTournamentStartGUI],
			["onlineTournamentJoinPrivate", this._onlineTournamentJoinPrivateGUI],
			["onlineTournamentJoinPublic", this._onlineTournamentJoinPublicGUI],
			["inMatchmaking", this._inMatchmakingGUI],
		]);
	}

	protected	ready()
	{
		this.switchMenu(this._menuGUI);
		this._titleGUI.classList.remove("hidden");
		this._sceneData.readyPromise.resolve();
	}

	private	setScenes()
	{
		const	childs = this._scenesParent.getChildren<TransformNode>(undefined, true);

		this._scenes = childs.reduce((accumulator : SceneMenuData[], currentValue : TransformNode) => {
			const	sceneMenuData = SceneManager.GetComponent<SceneMenuData>(currentValue, "SceneMenuData", false);

			if (sceneMenuData != null)
				accumulator.push(sceneMenuData);
			return accumulator;
		}, []);

	}

	private	createMenuGUI()
	{
		const	sceneButtonSwitch : SwitchButton = {
			items: this._scenes.map((scene) => scene.getSceneName()),
			currentItemIndex: 0,
			onItemChange: this.onSceneChange.bind(this)
		};
		const	enemyTypesButtonSwitch : SwitchButton = {
			items: enemyTypes,
			currentItemIndex: 0,
			onItemChange: this.onEnemyTypeChange.bind(this)
		};
		this._menuGUI = new MenuGUI(sceneButtonSwitch, enemyTypesButtonSwitch, this.onPlay.bind(this));
		this.addHiddenMenu(this._menuGUI);
	}

	private	addHiddenMenu(menu : HTMLElement)
	{
		this._menuParent.appendChild(menu);
		menu.classList.add("hidden");
	}

	private	onSceneChange(currentIndex : number, newIndex : number) : boolean
	{
		if (this._animation)
			return false;
		const	newScene = this._scenes[newIndex];
		const	currentScene = this._scenes[currentIndex];

		newScene.onSceneSwitch("added", 0.5, this._easeFunction);
		currentScene.onSceneSwitch("removed", 0.5, this._easeFunction);

		const	distance = this._scenes[newIndex].transform.position.subtract(this._scenes[currentIndex].transform.position);
		const	startPosition = this._scenesParent.position;
		const	endPosition = this._scenesParent.position.subtract(distance);

		this._animation = Animation.CreateAndStartAnimation("menuMapAnim", this._scenesParent, "position", 60, 30, startPosition, endPosition, Animation.ANIMATIONLOOPMODE_CONSTANT, this._easeFunction, () => { this._animation = null });

		this._sceneData.events.getObservable("scene-change").notifyObservers([currentScene.getSceneName(), newScene.getSceneName()]);

		this._timerManager.setTimeout(() => applyTheme(this._sceneData.pongHTMLElement, newScene.getTheme()), 250);
		this._currentSceneFileName = newScene.getSceneFileName();
		return true;
	}

	private	onEnemyTypeChange(_currentIndex : number, _newIndex : number) : boolean
	{
		const	currentType = enemyTypes[_currentIndex];
		const	newType = enemyTypes[_newIndex];

		this._sceneData.events.getObservable("enemy-type-change").notifyObservers([currentType, newType]);
		return true;
	}

	private onPlay(_sceneIndex : number, enemyTypeIndex : number)
	{
		const	enemyType = enemyTypes[enemyTypeIndex];

		if (enemyType === "Bot")
			this.switchMenu(this._botDifficultyChoiceGUI);
		else if (enemyType === "Local")
			this.switchMenu(this._localGameTypeChoiceGUI);
		else if (enemyType === "Multiplayer")
			this.switchMenu(this._onlineGameTypeChoiceGUI);
	}

	private startLocalTournamentGame()
	{
		const	profiles = this._localTournamentCreationGUI.getProfiles()
		if (profiles === null)
			return ;
		const	tournament = new LocalTournament(profiles);

		this.startLocalGame(this._currentSceneFileName, tournament);
	}

	private	async startOnlineGame(sceneName : FrontendGameSceneName, pushState = true)
	{
		try {
			this.switchMenu(this._inMatchmakingGUI, pushState);
			await this._sceneData.pongHTMLElement.searchOnlineGame(sceneName);
		} catch (error) {
			this._sceneData.pongHTMLElement.onError(error);
			this.switchMenu(this._onlineGameTypeChoiceGUI, false);
		}
	}

	private	async startLocalGame(sceneName : FrontendGameSceneName, tournament? : LocalTournament)
	{
		try {
			await this._sceneData.pongHTMLElement.startLocalGame(sceneName, tournament);
		} catch (error) {
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private	async startBotGame(sceneName : FrontendGameSceneName, difficulty : keyof BotDifficulty)
	{
		try {
			await this._sceneData.pongHTMLElement.startBotGame(sceneName, difficulty);
		} catch (error) {
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private	async createTournament()
	{
		const	settings = this._onlineTournamentCreationGUI.getOnlineTournamentSettings();

		if (settings === null)
			return ;
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			const	tournamentId = await this._sceneData.serverProxy.createTournament(settings);
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._onlineTournamentStartGUI.init("creator", tournamentId);
			this.switchMenu(this._onlineTournamentStartGUI);
		} catch (error) {
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private	async startTournament()
	{
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			await this._sceneData.serverProxy.startTournament();
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this.switchMenu(this._onlineTournamentChoiceGUI);
		} catch (error) {
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private async setAlias(guestName: string, newAlias : string)
	{
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			await this._sceneData.serverProxy.setAlias(newAlias);
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._onlineTournamentStartGUI.validate(guestName);
		} catch (error) {
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private async joinTournamentAsCreator()
	{
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			await this._sceneData.serverProxy.joinTournamentAsCreator();
			this._sceneData.pongHTMLElement.setButtonEnable(true);

			this._onlineTournamentStartGUI.setType("creator-player");
		} catch (error) {
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private	async joinTournament(tournamentId : string)
	{
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			const	participants = await this._sceneData.serverProxy.joinTournament(tournamentId);
			this._sceneData.pongHTMLElement.setButtonEnable(true);

			this._onlineTournamentStartGUI.init("player", tournamentId)
			participants.forEach(participant => {
				const	isNameInput = this._sceneData.serverProxy.getGuestName() === participant.guestName;

				this._onlineTournamentStartGUI.addParticipant(false, participant, isNameInput);
			})
			this.switchMenu(this._onlineTournamentStartGUI);
		} catch (error) {
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private	async leaveTournament()
	{
		const	tournamentData = this._sceneData.serverProxy.getTournamentData();

		if (tournamentData?.isCreator)
		{
			this._sceneData.serverProxy.leaveTournament();

			this._onlineTournamentStartGUI.setType("creator");
		}
		else
			history.back();
	}

	private	async refreshTournaments()
	{
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			const	tournaments = await this._sceneData.serverProxy.getTournaments();
			this._sceneData.pongHTMLElement.setButtonEnable(true);

			this._onlineTournamentJoinPublicGUI.setTournaments(tournaments);
		} catch (error) {
			this.switchMenu(this._onlineTournamentChoiceGUI);
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			this._sceneData.pongHTMLElement.onError(error);
		}
	}

	private	onTournamentEvent(tournamentEvent : TournamentEvent)
	{
		const	message =
			tournamentEvent.type === "kicked" ? "You have been kicked from the tournament" :
			tournamentEvent.type === "banned" ? "You have been banned from the tournament" :
			tournamentEvent.type === "tournament-canceled" ? "The tournament has been canceled" :
			null;
		if (message !== null)
		{
			this._sceneData.pongHTMLElement.onError(new PongError(message, "show"));
			this.switchMenu(this._onlineTournamentChoiceGUI);
		}
		else if (tournamentEvent.type === "add-participant")
		{
			const	tournamentData = this._sceneData.serverProxy.getTournamentData();

			if (!tournamentData)
				return ;
			const	areYouCreator = tournamentData.isCreator;
			const	canKickOrBan = areYouCreator && !tournamentEvent.isCreator;
			const	isNameInput = this._sceneData.serverProxy.getGuestName() === tournamentEvent.profile.guestName;

			this._onlineTournamentStartGUI.addParticipant(canKickOrBan, tournamentEvent.profile, isNameInput);
		}
		else if (tournamentEvent.type === "remove-participant")
			this._onlineTournamentStartGUI.removeParticipant(tournamentEvent.guestName);
		else if (tournamentEvent.type === "change-alias")
			this._onlineTournamentStartGUI.changeAlias(tournamentEvent.guestName, tournamentEvent.newAlias);
		else if (tournamentEvent.type === "tournament-start")
			this._sceneData.pongHTMLElement.startOnlineTournament(this._currentSceneFileName);
	}

	private	switchMenu(newGUI : HTMLElement, pushState = true)
	{
		if (pushState)
		{
			const	entry = this._statesGUI.entries().find(([_name, gui]) => gui === newGUI);
			if (entry !== undefined)
				history.pushState({}, "", `/pong/${entry[0]}`);
		}
		this._currentMenu?.classList.add("hidden");
		newGUI.classList.remove("hidden")
		this._currentMenu = newGUI;
	}

	protected destroy()
	{
		window.removeEventListener("popstate", this.onPopState);
		this._menuParent.remove();
	}

	private onPopState = () => {
		if (!location.pathname.startsWith("/pong/"))
			return ;
		const	guiName = location.pathname.slice(6);
		const	gui = this._statesGUI.get(guiName);

		if (!gui)
			return ;
		if (this._currentMenu === this._inMatchmakingGUI)
		{
			this._sceneData.serverProxy.leave();
			return ;
		}
		else if (this._currentMenu === this._onlineTournamentStartGUI)
		{
			history.replaceState({}, "", null);
			this._sceneData.serverProxy.leave();
		}
		if (gui === this._inMatchmakingGUI)
			this.startOnlineGame(this._currentSceneFileName, false);
		else if (gui === this._onlineTournamentStartGUI)
			return ;
		this.switchMenu(gui, false);
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
