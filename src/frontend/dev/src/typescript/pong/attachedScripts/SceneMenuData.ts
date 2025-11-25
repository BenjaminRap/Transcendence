import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { CreateSkybox } from "./CreateSkybox";
import { Animation, EasingFunction, Material, Nullable } from "@babylonjs/core";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { ThemeName } from "../menuStyles";

export class SceneMenuData extends ScriptComponent {
	public readonly sceneName! : string;
	public readonly sceneFileName! : string;
	public readonly style! : ThemeName;

	private _skyboxCreator : (TransformNode & { script : CreateSkybox }) | null = null;
	public _defaultSkybox : boolean = false;

	private _skyboxAnimation : Nullable<Animatable> = null;
	private _skyboxMaterial : Material | undefined;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "SceneMenuData") {
        super(transform, scene, properties, alias);
    }

	protected	start()
	{
		if (this._skyboxCreator != null)
		{
			this._skyboxCreator.script = SceneManager.GetComponent<CreateSkybox>(this._skyboxCreator, "CreateSkybox", false);
			const	skybox = this._skyboxCreator?.script.getSkybox();

			if (!skybox || !skybox.material)
				throw new Error("Invalid SkyboxCreator !");
			this._skyboxMaterial = skybox.material;

			if (!this._defaultSkybox)
				this._skyboxMaterial.alpha = 0;
		}
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
}

SceneManager.RegisterClass("SceneMenuData", SceneMenuData);
