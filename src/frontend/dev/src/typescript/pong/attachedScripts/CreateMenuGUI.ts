import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { FrontendSceneData } from "../FrontendSceneData";
import { MenuGUI } from "../MenuGUI";
import { Animation, EasingFunction, Nullable, SineEase } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";

export class CreateMenuGUI extends ScriptComponent {
	private _upImagePath! : string;
	private _mapsParent! : TransformNode;

	private _maps! : TransformNode[];
	private _animation : Nullable<Animatable> = null;
	private _easeFunction = new SineEase();

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateMenuGUI") {
        super(transform, scene, properties, alias);
		this._easeFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    }

	protected	awake()
	{
		this._maps = this._mapsParent.getChildren<TransformNode>(undefined, true);

		const	sceneData = this.scene.metadata.sceneData;

		if (!(sceneData instanceof FrontendSceneData))
			throw new Error("The scene.metadata should have a sceneData variable of type FrontendSceneData !");
		const	pongHTMLElement = sceneData.pongHTMLElement;

		const	mapsName = this._maps.map((map) => map.name);
		const	menuGUI = new MenuGUI(this._upImagePath, mapsName, this.onSceneChange.bind(this));

		pongHTMLElement.appendChild(menuGUI);
	}

	private	onSceneChange(currentIndex : number, newIndex : number)
	{
		if (this._animation)
			this._animation.stop();
		const	distance = this._maps[newIndex].position.subtract(this._maps[currentIndex].position);
		const	startPosition = this._mapsParent.position;
		const	endPosition = this._mapsParent.position.subtract(distance);
		this._animation = Animation.CreateAndStartAnimation("menuMapAnim", this._mapsParent, "position", 60, 30, startPosition, endPosition, Animation.ANIMATIONLOOPMODE_CONSTANT, this._easeFunction);
	}
}

SceneManager.RegisterClass("CreateMenuGUI", CreateMenuGUI);
