import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CreateSkybox } from "./CreateSkybox";
import { Animation, Color4, EasingFunction, Material, type Nullable } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { type ThemeName, zodThemeName } from "../menuStyles";
import { Imported } from "@shared/ImportedDecorator";
import { ImportedComponentOptional, zodBoolean, zodNumber, zodString } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { zodRange, Range } from "../Range";

export class SceneMenuData extends CustomScriptComponent {
	@Imported(zodString) private _sceneName! : string;
	@Imported(zodString) private _sceneFileName! : string;
	@Imported(zodThemeName) private _style! : ThemeName;
	@ImportedComponentOptional(CreateSkybox) private _skyboxCreator! : CreateSkybox | null;
	@Imported(zodBoolean) private _defaultSkybox! : boolean;
	@Imported(zodBoolean) private _fogEnabled! : boolean;
	@Imported(zodRange) private _fogRange! : Range;
	@Imported(zodNumber) private _fogDensity! : number;
	@Imported(Color4) private _fogColor! : Color4;

	private _skyboxAnimation : Nullable<Animatable> = null;
	private _skyboxMaterial : Material | undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "SceneMenuData") {
        super(transform, scene, properties, alias);
    }

	protected	start()
	{
		if (this._skyboxCreator === null)
			return ;
		const	skybox = this._skyboxCreator.getSkybox();

		if (!skybox || !skybox.material)
			throw new Error("Invalid SkyboxCreator !");
		this._skyboxMaterial = skybox.material;

		if (!this._defaultSkybox)
			this._skyboxMaterial.alpha = 0;
		else
			this.setFog();
	}

	public onSceneSwitch(state : "removed" | "added", transitionDuration : number, easingFunction : EasingFunction)
	{
		const	newAlpha = (state === "removed") ? 0 : 1;

		this.setSkyboxAlpha(newAlpha, transitionDuration, easingFunction);
		if (state === "added")
			this.setFog();
	}

	private	setFog()
	{
		this.scene.fogEnabled = this._fogEnabled;
		this.scene.fogMode = Scene.FOGMODE_EXP;
		this.scene.fogStart = this._fogRange.min;
		this.scene.fogEnd = this._fogRange.max;
		this.scene.fogDensity = this._fogDensity;
		this.scene.fogColor.set(this._fogColor.r, this._fogColor.g, this._fogColor.b);
		console.log(this.scene.fogStart, this.scene.fogEnd, this.scene.fogDensity, this.scene.fogColor);
	}

	private	setSkyboxAlpha(newAlpha : number, duration : number, easingFunction : EasingFunction)
	{
		if (!this._skyboxMaterial)
			return ;
		if (this._skyboxAnimation !== null)
			this._skyboxAnimation.stop();

		const	previousAlphaValue = this._skyboxMaterial.alpha;

		this._skyboxAnimation = Animation.CreateAndStartAnimation("skyboxBlend", this._skyboxMaterial, "alpha", 60, 60 * duration, previousAlphaValue, newAlpha, Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction, () => { this._skyboxAnimation = null });
	}

	public getSceneName()
	{
		return this._sceneName;
	}

	public getSceneFileName()
	{
		return this._sceneFileName;
	}

	public getStyle()
	{
		return this._style;
	}
}

SceneManager.RegisterClass("SceneMenuData", SceneMenuData);
