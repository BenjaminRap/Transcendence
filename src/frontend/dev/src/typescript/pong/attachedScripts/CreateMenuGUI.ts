import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI, SwitchButton } from "../MenuGUI";
import { Animation, EasingFunction, Nullable, SineEase } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";

export class CreateMenuGUI extends ScriptComponent {
	private _upImagePath! : string;
	private _scenesParent! : TransformNode;

	private _scenes! : TransformNode[];
	private _animation : Nullable<Animatable> = null;
	private _easeFunction = new SineEase();

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
		this._easeFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    }

	protected	awake()
	{
		this._scenes = this._scenesParent.getChildren<TransformNode>(undefined, true);

		const	sceneData = this.scene.metadata.sceneData;

		if (!(sceneData instanceof FrontendSceneData))
			throw new Error("The scene.metadata should have a sceneData variable of type FrontendSceneData !");
		const	pongHTMLElement = sceneData.pongHTMLElement;

		const	sceneButtonSwitch : SwitchButton = {
			items: this._scenes.map((map) => map.name),
			currentItemIndex: 0,
			onItemChange: this.onSceneChange.bind(this)
		};
		const	enemyTypesButtonSwitch : SwitchButton = {
			items: [ "Local", "Multiplayer", "Bot" ],
			currentItemIndex: 0,
			onItemChange: this.onEnemyTypeChange.bind(this)
		};
		const	menuGUI = new MenuGUI(this._upImagePath, sceneButtonSwitch, enemyTypesButtonSwitch);

		pongHTMLElement.appendChild(menuGUI);
	}

	private	onSceneChange(currentIndex : number, newIndex : number) : boolean
	{
		if (this._animation)
			return false;
		const	distance = this._scenes[newIndex].position.subtract(this._scenes[currentIndex].position);
		const	startPosition = this._scenesParent.position;
		const	endPosition = this._scenesParent.position.subtract(distance);
		this._animation = Animation.CreateAndStartAnimation("menuMapAnim", this._scenesParent, "position", 60, 30, startPosition, endPosition, Animation.ANIMATIONLOOPMODE_CONSTANT, this._easeFunction, () => { this._animation = null });
		return true
	}

	private	onEnemyTypeChange(currentIndex : number, newIndex : number) : boolean
	{
		console.log("test");
		return true;
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
