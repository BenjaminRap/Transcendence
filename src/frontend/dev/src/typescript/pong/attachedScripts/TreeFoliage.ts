import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Color4, Material, MultiMaterial, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { buildStylizedFoliageMaterial } from "../shaders/stylizedFoliage";
import { zodNumber } from "@shared/ImportedHelpers";
import { Imported } from "@shared/ImportedDecorator";

export class TreeFoliage extends CustomScriptComponent {
	@Imported(zodNumber) private _windSpeed! : number;
	@Imported(Vector3) private _maxBounds! : Vector3;
	@Imported(Vector3) private _center! : Vector3;
	@Imported(Vector2) private _windContrast! : Vector2;
	@Imported(zodNumber) private _windStrength! : number;
	@Imported(zodNumber) private _windSwaySpeed! : number;
	@Imported(zodNumber) private _windSwayScale! : number;
	@Imported(zodNumber) private _windTextureSubtract! : number;
	@Imported(Vector3) private _windSwayDirection! : Vector3;
	@Imported(Color4) private _windSwayColor! : Color4;
	@Imported(Texture) private _leavesTexture! : Texture;
	@Imported(Texture) private _windTexture! : Texture;
	@Imported(Material) private _currentLeavesMaterial! : Material;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "TreeFoliage") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		this._leavesTexture.vScale = -1;
		this._windTexture.vScale = -1;
		const	foliageMaterial = this.getTreeFoliageMaterial();

		this.replaceMaterial(this._currentLeavesMaterial, foliageMaterial);
	}

	private	replaceMaterial(currentMaterial : Material, newMaterial : Material)
	{

		this.scene.meshes.forEach((mesh : AbstractMesh) => {
			if (mesh.material instanceof MultiMaterial)
			{
				const	multiMaterial = mesh.material;

				multiMaterial.subMaterials.forEach((material : Material | null, index : number) => {
					if (material === currentMaterial)
						multiMaterial.subMaterials[index] = newMaterial;
				});
			}
			else if (mesh.material === currentMaterial)
				mesh.material = newMaterial;
		});
	}

	private	getTreeFoliageMaterial()
	{
		const	[ material, inputs ] = buildStylizedFoliageMaterial("stylizedFoliage", this.scene);

		inputs.mainImageSource.texture = this._leavesTexture;
		inputs.windSpeed.value = this._windSpeed;
		inputs.maxBounds.value = this._maxBounds;
		inputs.center.value = this._center;
		inputs.windContrast.value = this._windContrast;
		inputs.windStrength.value = this._windStrength;
		inputs.windSwaySpeed.value = this._windSwaySpeed;
		inputs.windSwayScale.value = this._windSwayScale;
		inputs.windTextureSubtract.value = this._windTextureSubtract;
		inputs.windSwayDirection.value = this._windSwayDirection;
		inputs.windSwayColor.value = this._windSwayColor;
		inputs.windTextureSource.texture = this._windTexture;

		return material;
	}
}

SceneManager.RegisterClass("TreeFoliage", TreeFoliage);
