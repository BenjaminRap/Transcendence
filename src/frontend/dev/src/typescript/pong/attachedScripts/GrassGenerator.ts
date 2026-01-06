import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { buildStylizedGrassMaterial } from "../shaders/stylizedGrass";
import { Color4, FreeCamera, Texture } from "@babylonjs/core";
import { Imported } from "@shared/ImportedDecorator";
import { ImportedCamera, zodNumber } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class GrassGenerator extends CustomScriptComponent {
	@Imported(Mesh, true) private _grassMeshes! : Mesh[];
	@ImportedCamera private _camera! : FreeCamera;
	@Imported(Texture) private _grassTexture! : Texture;
	@Imported(Color4) 	private _bottomColor! : Color4;
	@Imported(Color4) private _nearColor! : Color4;
	@Imported(Color4) private _farColor! : Color4;
	@Imported(zodNumber) private _windSpeed! : number;
	@Imported(Vector3) private _windDirection! : Vector3;
	@Imported(zodNumber) private _windSwayScale! : number;
	@Imported(zodNumber) private _windSwaySpeed! : number;
	@Imported(zodNumber) private _windTextureSubtract! : number;
	@Imported(Vector3) private _windSwayDirection! : Vector3;
	@Imported(Color4) private _swayColor! : Color4;
	@Imported(zodNumber) private _grassMaxDistance! : number;
	@Imported(Texture) private _windTexture! : Texture;
	@Imported(Vector2) private _shadowRange! : Vector2;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GrassGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{	
		this.setAllGrassMaterials();
	}

	private	setAllGrassMaterials()
	{
		this._grassTexture.vScale = -1;
		this._windTexture.vScale = -1;
		this._grassMeshes.forEach((mesh : Mesh) => {
			this.setGrassMaterial(mesh);
		});
	}

	private	setGrassMaterial(grassMesh : Mesh)
	{
		const	[material, _inputs] = buildStylizedGrassMaterial("stylizedGrass", this.scene);

		const	rawBoundingInfo = grassMesh.getRawBoundingInfo();
		const	minHeight = rawBoundingInfo.boundingBox.minimum;
		const	maxHeight = rawBoundingInfo.boundingBox.maximum;
		const	near = this._camera.minZ;
		const	far = this._grassMaxDistance;

		grassMesh.material = material;
		_inputs.mainTextureSource.texture = this._grassTexture;
		_inputs.bottomColor.value = this._bottomColor;
		_inputs.nearColor.value = this._nearColor;
		_inputs.farColor.value = this._farColor;
		_inputs.near.value = near;
		_inputs.far.value = far;
		_inputs.minHeight.value = minHeight.y;
		_inputs.maxHeight.value = maxHeight.y;
		_inputs.windSpeed.value = this._windSpeed;
		_inputs.windDirection.value = this._windDirection;
		_inputs.windSwayScale.value = this._windSwayScale;
		_inputs.windSwaySpeed.value = this._windSwaySpeed;
		_inputs.windTextureSubtract.value = this._windTextureSubtract;
		_inputs.windSwayDirection.value = this._windSwayDirection;
		_inputs.swayColor.value = this._swayColor;
		_inputs.windTextureSource.texture = this._windTexture;
		_inputs.shadowRange.value = this._shadowRange;
	}

}

SceneManager.RegisterClass("GrassGenerator", GrassGenerator);
