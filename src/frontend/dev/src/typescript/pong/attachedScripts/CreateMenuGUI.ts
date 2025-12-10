import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI, type SwitchButton } from "../MenuGUI";
import { Animation, EasingFunction, type Nullable, SineEase } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { SceneMenuData } from "./SceneMenuData";
import { InMatchmakingGUI } from "../InMatchmakingGUI";
import { getFrontendSceneData } from "../PongGame";
import { applyTheme, type ThemeName } from "../menuStyles";
import { TitleGUI } from "../TitleGUI";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";

export class CreateMenuGUI extends CustomScriptComponent {
	private static readonly _enemyTypes = [ "Local", "Multiplayer", "Bot" ];

	@Imported(TransformNode) private _scenesParent! : TransformNode;

	private _scenes! : SceneMenuData[];
	private _animation : Nullable<Animatable> = null;
	private _easeFunction = new SineEase();
	private _sceneData : FrontendSceneData;
	private _menuGUI! : MenuGUI;
	private _inMatchmakingGUI! : InMatchmakingGUI;
	private _titleGUI! : TitleGUI;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
		this._easeFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected	awake()
	{
		this.setScenes();
		const	theme : ThemeName = (this._scenes.length === 0) ? "basic" : this._scenes[0].getTheme();

		applyTheme(this._sceneData.pongHTMLElement, theme)
		this.createTitleGUI();
		this.createMenuGUI();
		this.createInMatchmakingGUI();
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
		this._sceneData.pongHTMLElement.appendChild(this._titleGUI);
		this._titleGUI.classList.add("hidden");
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
		const	skinsButtonSwitch : SwitchButton = {
			items: [ "knight", "magician" ],
			currentItemIndex: 0,
			onItemChange: this.onSkinChange.bind(this)
		};
		this._menuGUI = new MenuGUI(sceneButtonSwitch, enemyTypesButtonSwitch, skinsButtonSwitch, this.onPlay.bind(this));
		this._sceneData.pongHTMLElement.appendChild(this._menuGUI);
		this._menuGUI.classList.add("hidden");
	}


	private	createInMatchmakingGUI()
	{
		this._inMatchmakingGUI = new InMatchmakingGUI();
		this._sceneData.pongHTMLElement.appendChild(this._inMatchmakingGUI);
		this._inMatchmakingGUI.classList.add("hidden");
		
		const	cancelButton = this._inMatchmakingGUI.getCancelButton()!;

		cancelButton.addEventListener("click", () => { this.cancelMatchmaking() });
	}

	private	onSceneChange(currentIndex : number, newIndex : number) : boolean
	{
		if (this._animation)
			return false;
		const	newScene = this._scenes[newIndex];
		const	currentScene = this._scenes[currentIndex];

		newScene.onSceneSwitch("added", 0.5, this._easeFunction);
		currentScene.onSceneSwitch("removed", 0.5, this._easeFunction);

		const	newStyle = newScene.getTheme();

		applyTheme(this._sceneData.pongHTMLElement, newStyle);
		const	distance = this._scenes[newIndex].transform.position.subtract(this._scenes[currentIndex].transform.position);
		const	startPosition = this._scenesParent.position;
		const	endPosition = this._scenesParent.position.subtract(distance);

		this._animation = Animation.CreateAndStartAnimation("menuMapAnim", this._scenesParent, "position", 60, 30, startPosition, endPosition, Animation.ANIMATIONLOOPMODE_CONSTANT, this._easeFunction, () => { this._animation = null });
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
		return true;
	}

	private	onSkinChange(_currentIndex : number, _newIndex : number) : boolean
	{
		return true;
	}

	private onPlay(sceneIndex : number, enemyTypeIndex : number, _skinIndex : number)
	{
		const	sceneName = this._scenes[sceneIndex].getSceneFileName();

		if (sceneName !== "Basic.gltf" && sceneName !== "Magic.gltf" && sceneName !== "Terminal.gltf")
		{
			console.error(`Wrong scene file name : ${sceneName}`);
			return ;
		}

		const	enemyType = CreateMenuGUI._enemyTypes[enemyTypeIndex];

		if (enemyType === "Local")
			this._sceneData.pongHTMLElement.startLocalGame(sceneName);
		else if (enemyType === "Multiplayer")
		{
			this._inMatchmakingGUI.classList.remove("hidden");
			this._menuGUI.classList.add("hidden");
			this._sceneData.pongHTMLElement.startOnlineGame(sceneName);
		}
		else if (enemyType === "Bot")
			this._sceneData.pongHTMLElement.startBotGame(sceneName);
	}

	protected destroy()
	{
		if (this._menuGUI)
			this._menuGUI.remove();
		if (this._inMatchmakingGUI)
			this._inMatchmakingGUI.remove();
		if (this._titleGUI)
			this._titleGUI.remove();
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
