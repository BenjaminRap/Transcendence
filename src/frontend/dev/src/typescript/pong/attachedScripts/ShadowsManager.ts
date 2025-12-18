import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { DirectionalLight, type int, ShadowGenerator } from "@babylonjs/core";
import { Imported } from "@shared/ImportedDecorator";
import { zodInt } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class ShadowsManager extends CustomScriptComponent {
	@Imported(TransformNode) private _mainLight! : TransformNode;
	@Imported(AbstractMesh, true) private _shadowReceivers! : AbstractMesh[];
	@Imported(zodInt) private _lightmapSize! : int;

	private	_shadowGenerator! : ShadowGenerator;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ShadowsManager") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	lightRig = SceneManager.FindSceneLightRig(this._mainLight)

		if (!(lightRig instanceof DirectionalLight))
			throw new Error("The main light should be a directional light !");
		this._shadowGenerator = new ShadowGenerator(this._lightmapSize, lightRig);
	}

	protected	start()
	{

		this._shadowReceivers.forEach((mesh : AbstractMesh) => {
			this._shadowGenerator.addShadowCaster(mesh);
		})
	}

	public addShadowReceiver(mesh : AbstractMesh)
	{
		this._shadowGenerator.addShadowCaster(mesh);
	}
}

SceneManager.RegisterClass("ShadowsManager", ShadowsManager);
