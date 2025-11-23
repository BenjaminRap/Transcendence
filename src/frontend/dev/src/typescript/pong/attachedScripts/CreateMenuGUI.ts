import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI, SwitchButton } from "../MenuGUI";
import { Animation, EasingFunction, Nullable, SineEase } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { SceneMenuData } from "./SceneMenuData";
import { InMatchmakingGUI } from "../InMatchmakingGUI";
import { getFrontendSceneData } from "../PongGame";

export class CreateMenuGUI extends ScriptComponent {
	private static readonly _enemyTypes = [ "Local", "Multiplayer", "Bot" ];

	private _arrowImagePath! : string;
	private _scenesParent! : TransformNode;

	private _scenes! : SceneMenuData[];
	private _animation : Nullable<Animatable> = null;
	private _easeFunction = new SineEase();
	private _sceneData : FrontendSceneData;
	private _menuGUI! : MenuGUI;
	private _inMatchmakingGUI! : InMatchmakingGUI;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
		this._easeFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
		this._sceneData = getFrontendSceneData(this.scene);
    }

	protected	awake()
	{
		this.setScenes();
		this.createMenuGUI();
		this.createInMatchmakingGUI();
	}

	protected	ready()
	{
		this._menuGUI.classList.remove("hidden");
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
			items: this._scenes.map((scene) => scene.sceneName),
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
		this._menuGUI = new MenuGUI(this._arrowImagePath, sceneButtonSwitch, enemyTypesButtonSwitch, skinsButtonSwitch, this.onPlay.bind(this));
		this._sceneData.pongHTMLElement.appendChild(this._menuGUI);
		this._menuGUI.classList.add("hidden");
	}


	private	createInMatchmakingGUI()
	{
		this._inMatchmakingGUI = new InMatchmakingGUI();
		this._sceneData.pongHTMLElement.appendChild(this._inMatchmakingGUI);
		this._inMatchmakingGUI.classList.add("hidden");
		
		const	cancelButton = this._inMatchmakingGUI.getCancelButton()!;

		cancelButton.addEventListener("click", () => { this.quitMatchmaking() });
	}

	private	onSceneChange(currentIndex : number, newIndex : number) : boolean
	{
		if (this._animation)
			return false;
		this._scenes[newIndex].onSceneSwitch("added", 0.5, this._easeFunction);
		this._scenes[currentIndex].onSceneSwitch("removed", 0.5, this._easeFunction);
		const	distance = this._scenes[newIndex].transform.position.subtract(this._scenes[currentIndex].transform.position);
		const	startPosition = this._scenesParent.position;
		const	endPosition = this._scenesParent.position.subtract(distance);
		this._animation = Animation.CreateAndStartAnimation("menuMapAnim", this._scenesParent, "position", 60, 30, startPosition, endPosition, Animation.ANIMATIONLOOPMODE_CONSTANT, this._easeFunction, () => { this._animation = null });
		return true;
	}

	private	quitMatchmaking()
	{
		this._inMatchmakingGUI.classList.add("hidden");
		this._menuGUI.classList.remove("hidden");
		this._sceneData.pongHTMLElement.cancelMatchmaking();
	}

	private	onEnemyTypeChange(currentIndex : number, newIndex : number) : boolean
	{
		console.log("enemy type change");
		return true;
	}

	private	onSkinChange(currentIndex : number, newIndex : number) : boolean
	{
		console.log("skin change");
		return true;
	}

	private onPlay(sceneIndex : number, enemyTypeIndex : number, skinIndex : number)
	{
		const	sceneName = this._scenes[sceneIndex].sceneFileName;

		if (sceneName !== "Basic.gltf" && sceneName !== "Magic.gltf")
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
		else
			console.error("Not implemented yet !!");
	}

	protected destroy()
	{
		if (this._menuGUI)
			this._menuGUI.remove();
		if (this._inMatchmakingGUI)
			this._inMatchmakingGUI.remove();
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
