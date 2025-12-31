import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI, type SwitchButton } from "../gui/MenuGUI";
import { Animation, EasingFunction, type Nullable, SineEase } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { SceneMenuData } from "./SceneMenuData";
import { InMatchmakingGUI } from "../gui/InMatchmakingGUI";
import { getFrontendSceneData, type SceneFileName } from "../PongGame";
import { applyTheme } from "../menuStyles";
import { TitleGUI } from "../gui/TitleGUI";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { TimerManager } from "@shared/attachedScripts/TimerManager";
import { GameTypeChoiceGUI } from "../gui/GameTypeChoiceGUI";
import { LocalTournamentCreationGUI } from "../gui/LocalTournamentCreationGUI";
import { LocalTournament } from "../LocalTournament";

export class CreateMenuGUI extends CustomScriptComponent {
	private static readonly _enemyTypes = [ "Local", "Multiplayer", "Bot" ];

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
	private _onlineGameTypeChoiceGUI! : GameTypeChoiceGUI;
	private _localTournamentCreationGUI!: LocalTournamentCreationGUI;
	private _currentSceneFileName! : SceneFileName;
	private _menuParent! : HTMLDivElement;

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
			throw new Error("There is no scene in the menu !");
		this._currentSceneFileName = this._scenes[0].getSceneFileName();
		const	theme = this._scenes[0].getTheme();

		applyTheme(this._sceneData.pongHTMLElement, theme)
		this.createTitleGUI();
		this.createMenuGUI();
		this.createInMatchmakingGUI();
		this.CreateLocalGameTypeChoiceGUI();
		this.CreateOnlineGameTypeChoiceGUI();
		this.CreateLocalTournamentCreationGUI();
	}

	protected	ready()
	{
		this._menuGUI.classList.remove("hidden");
		this._titleGUI.classList.remove("hidden");
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

	private	createTitleGUI()
	{
		this._titleGUI = new TitleGUI();
		this.addHiddenMenu(this._titleGUI);
	}

	private	createMenuGUI()
	{
		const	sceneButtonSwitch : SwitchButton = {
			items: this._scenes.map((scene) => scene.getSceneName()),
			currentItemIndex: 0,
			onItemChange: this.onSceneChange.bind(this)
		};
		const	enemyTypesButtonSwitch : SwitchButton = {
			items: CreateMenuGUI._enemyTypes,
			currentItemIndex: 0,
			onItemChange: this.onEnemyTypeChange.bind(this)
		};
		this._menuGUI = new MenuGUI(sceneButtonSwitch, enemyTypesButtonSwitch, this.onPlay.bind(this));
		this.addHiddenMenu(this._menuGUI);
	}


	private	createInMatchmakingGUI()
	{
		this._inMatchmakingGUI = new InMatchmakingGUI();
		this.addHiddenMenu(this._inMatchmakingGUI);
		
		const	cancelButton = this._inMatchmakingGUI.getCancelButton()!;

		cancelButton.addEventListener("click", () => { this.cancelMatchmaking() });
	}

	private	CreateLocalGameTypeChoiceGUI()
	{
		this._localGameTypeChoiceGUI = new GameTypeChoiceGUI();
		this.addHiddenMenu(this._localGameTypeChoiceGUI);
		
		const	inputs = this._localGameTypeChoiceGUI.getInputs()!;

		inputs.twoVersusTwo.addEventListener("click", () => {
			this.startGame(this._currentSceneFileName, "Local");
		});
		inputs.tournament.addEventListener("click", () => {
			this.switchMenu(this._localGameTypeChoiceGUI, this._localTournamentCreationGUI);
		});
		inputs.cancel.addEventListener("click", () => {
			this.switchMenu(this._localGameTypeChoiceGUI, this._menuGUI);
		});
	}

	private	CreateOnlineGameTypeChoiceGUI()
	{
		this._onlineGameTypeChoiceGUI = new GameTypeChoiceGUI();
		this.addHiddenMenu(this._onlineGameTypeChoiceGUI);
		
		const	inputs = this._onlineGameTypeChoiceGUI.getInputs()!;

		inputs.twoVersusTwo.addEventListener("click", () => {
			this.switchMenu(this._onlineGameTypeChoiceGUI, this._inMatchmakingGUI);
			this.startGame(this._currentSceneFileName, "Multiplayer");
		});
		inputs.tournament.addEventListener("click", () => {
			console.log("tournament !");
		});
		inputs.cancel.addEventListener("click", () => {
			this.switchMenu(this._onlineGameTypeChoiceGUI, this._menuGUI);
		});
	}

	private	CreateLocalTournamentCreationGUI()
	{
		this._localTournamentCreationGUI = new LocalTournamentCreationGUI();
		this.addHiddenMenu(this._localTournamentCreationGUI);

		const	inputs = this._localTournamentCreationGUI.getInputs();

		inputs?.start.addEventListener("click", () => {
			const	profiles = this._localTournamentCreationGUI.getProfiles()
			if (profiles === null)
				return ;
			const	tournament = new LocalTournament(profiles);

			this.startGame(this._currentSceneFileName, "Local", tournament);
		});
		inputs?.cancel.addEventListener("click", () => {
			this._localTournamentCreationGUI.reset();
			this.switchMenu(this._localTournamentCreationGUI, this._localGameTypeChoiceGUI);
		});
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
		this._inMatchmakingGUI.classList.add("hidden");
		this._menuGUI.classList.remove("hidden");
		this._sceneData.pongHTMLElement.cancelMatchmaking();
	}

	private	onEnemyTypeChange(_currentIndex : number, _newIndex : number) : boolean
	{
		const	currentType = CreateMenuGUI._enemyTypes[_currentIndex];
		const	newType = CreateMenuGUI._enemyTypes[_newIndex];

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

		const	enemyType = CreateMenuGUI._enemyTypes[enemyTypeIndex];

		if (enemyType === "Bot")
			this.startGame(sceneName, enemyType);
		else if (enemyType === "Local")
			this.switchMenu(this._menuGUI, this._localGameTypeChoiceGUI);
		else if (enemyType === "Multiplayer")
			this.switchMenu(this._menuGUI, this._onlineGameTypeChoiceGUI);
	}

	private	startGame(sceneName : SceneFileName, enemyType : string, tournament? : LocalTournament)
	{
		if (enemyType === "Local")
			this._sceneData.pongHTMLElement.startLocalGame(sceneName, tournament);
		else if (enemyType === "Multiplayer")
		{
			this._sceneData.pongHTMLElement.startOnlineGame(sceneName, tournament);
		}
		else if (enemyType === "Bot")
			this._sceneData.pongHTMLElement.startBotGame(sceneName);
	}

	private	switchMenu(currentGUI : HTMLElement, newGUI : HTMLElement)
	{
		currentGUI.classList.add("hidden");
		newGUI.classList.remove("hidden")
	}

	protected destroy()
	{
		this._menuParent.remove();
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
