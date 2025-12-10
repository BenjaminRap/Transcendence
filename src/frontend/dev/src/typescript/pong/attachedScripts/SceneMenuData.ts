import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CreateSkybox } from "./CreateSkybox";
import { Animation, EasingFunction, Material, type Nullable } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { type ThemeName, zodThemeName } from "../menuStyles";
import { Imported } from "@shared/ImportedDecorator";
import { ImportedComponentOptional, zodBoolean, zodString } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class SceneMenuData extends CustomScriptComponent {
	@Imported(zodString) private _sceneName! : string;
	@Imported(zodString) private _sceneFileName! : string;
	@Imported(zodThemeName) private _theme! : ThemeName;
	@ImportedComponentOptional(CreateSkybox) private _skyboxCreator! : CreateSkybox | null;
	@Imported(zodBoolean) private _defaultSkybox! : boolean;

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
	}

	public onSceneSwitch(state : "removed" | "added", transitionDuration : number, easingFunction : EasingFunction)
	{
		const	newAlpha = (state === "removed") ? 0 : 1;

		this.setSkyboxAlpha(newAlpha, transitionDuration, easingFunction);
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

	public getTheme()
	{
		return this._theme;
	}
}

SceneManager.RegisterClass("SceneMenuData", SceneMenuData);
