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

const enemyTypes = ["Local", "Multiplayer", "Bot"] as const;
type EnemyType = typeof enemyTypes[number];

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
		this._sceneData.events.getObservable("tournament-event").add(tournamentEvent => this.onTournamentEvent(tournamentEvent));
	}

	private	createMenus()
	{
		this.createMenuGUI();

		this._titleGUI = initMenu(new TitleGUI(), undefined, this._menuParent);
		this._inMatchmakingGUI = initMenu(new InMatchmakingGUI(), {
			cancelButton: () => this.cancelMatchmaking()
		}, this._menuParent);
		this._localGameTypeChoiceGUI = initMenu(new GameTypeChoiceGUI(), {
			twoVersusTwo: () => this.startGame(this._currentSceneFileName, "Local", undefined),
			tournament: () => {
				this._localTournamentCreationGUI.reset();
				this.switchMenu(this._localTournamentCreationGUI)
			},
			cancel: () => this.switchMenu(this._menuGUI)
		}, this._menuParent);
		this._onlineGameTypeChoiceGUI = initMenu(new GameTypeChoiceGUI(), {
			twoVersusTwo: () => this.startGame(this._currentSceneFileName, "Multiplayer", undefined),
			tournament: () => this.switchMenu(this._onlineTournamentChoiceGUI),
			cancel: () => this.switchMenu(this._menuGUI)
		}, this._menuParent)
		this._localTournamentCreationGUI = initMenu(new LocalTournamentCreationGUI(), {
			start: () => this.startLocalTournamentGame(),
			cancel: () => this.switchMenu(this._localGameTypeChoiceGUI)
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
			cancel: () => this.switchMenu(this._onlineGameTypeChoiceGUI),
		}, this._menuParent);
		this._onlineTournamentCreationGUI = initMenu(new OnlineTournamentCreationGUI(), {
			create: () => this.createTournament(),
			cancel: () => this.switchMenu(this._onlineTournamentChoiceGUI)
		}, this._menuParent);
		this._onlineTournamentStartGUI = initMenu(new OnlineTournamentStartGUI(), {
			start: () => this.startTournament(),
			join: () => this.joinTournamentAsCreator(),
			leave: () => this.leaveTournament(),
			cancel: () => this.cancelTournament()
		}, this._menuParent);
		this._onlineTournamentJoinPrivateGUI = initMenu(new OnlineTournamentJoinPrivateGUI(), {
			join: () => this.joinTournament(this._onlineTournamentJoinPrivateGUI.getTournamentId()),
			cancel: () => this.switchMenu(this._onlineTournamentChoiceGUI)
		}, this._menuParent);
		this._onlineTournamentJoinPublicGUI = initMenu(new OnlineTournamentJoinPublicGUI(), {
			refresh: () => this.refreshTournaments(),
			cancel: () => this.switchMenu(this._onlineTournamentChoiceGUI)
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

	private	cancelMatchmaking()
	{
		this.switchMenu(this._menuGUI);
		this._sceneData.serverProxy.leaveMatchmaking();
	}

	private	onEnemyTypeChange(_currentIndex : number, _newIndex : number) : boolean
	{
		const	currentType = enemyTypes[_currentIndex];
		const	newType = enemyTypes[_newIndex];

		this._sceneData.events.getObservable("enemy-type-change").notifyObservers([currentType, newType]);
		return true;
	}

	private onPlay(sceneIndex : number, enemyTypeIndex : number)
	{
		const	sceneName = this._scenes[sceneIndex].getSceneFileName();

		if (sceneName !== "Basic.gltf" && sceneName !== "Magic.gltf" && sceneName !== "Terminal.gltf")
		{
			console.error(`Wrong scene file name : ${sceneName}`);
			return ;
		}

		const	enemyType = enemyTypes[enemyTypeIndex];

		if (enemyType === "Bot")
			this.startGame(sceneName, enemyType, undefined);
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

		this.startGame(this._currentSceneFileName, "Local", tournament);
	}

	private	async startGame<T extends EnemyType>(
		sceneName : FrontendGameSceneName,
		enemyType : T,
		tournament : T extends "Local" ? LocalTournament | undefined : undefined)
	{
		try {
			if (enemyType === "Local")
				await this._sceneData.pongHTMLElement.startLocalGame(sceneName, tournament);
			else if (enemyType === "Multiplayer")
			{
				this.switchMenu(this._inMatchmakingGUI);
				await this._sceneData.pongHTMLElement.searchOnlineGame(sceneName);
			}
			else if (enemyType === "Bot")
				await this._sceneData.pongHTMLElement.startBotGame(sceneName);
		} catch (error) {
			this._sceneData.pongHTMLElement.onError(error);
			this.switchMenu(this._menuGUI);
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

	private	async cancelTournament()
	{
		this._sceneData.serverProxy.cancelTournament();
		this.switchMenu(this._onlineTournamentCreationGUI);
	}

	private	async startTournament()
	{
		try {
			this._sceneData.pongHTMLElement.setButtonEnable(false);
			await this._sceneData.serverProxy.startTournament();
			this._sceneData.pongHTMLElement.setButtonEnable(true);
			const	tournamentData = this._sceneData.serverProxy.getTournamentData();

			if (!tournamentData)
				this.switchMenu(this._onlineTournamentChoiceGUI);
			else
				this._sceneData.pongHTMLElement.startOnlineTournament(this._currentSceneFileName);
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
		this._sceneData.serverProxy.leaveTournament();
		const	tournamentData = this._sceneData.serverProxy.getTournamentData();

		if (tournamentData?.isCreator)
			this._onlineTournamentStartGUI.setType("creator");
		else
			this.switchMenu(this._onlineTournamentChoiceGUI);
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
		const	tournamentData = this._sceneData.serverProxy.getTournamentData();

		if (!tournamentData)
			return ;
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

	private	switchMenu(newGUI : HTMLElement)
	{
		this._currentMenu?.classList.add("hidden");
		newGUI.classList.remove("hidden")
		this._currentMenu = newGUI;
	}

	protected destroy()
	{
		this._menuParent.remove();
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
