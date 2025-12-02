import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getRandomCoordinatesInTrapeze } from "../utilities";
import { RandomTerrainGenerator } from "./RandomTerrainGenerator";
import { Lod, zodLodLevel, type LodLevel, type LodLevelProcessed } from "../Lod";
import { buildStylizedGrassMaterial } from "../shaders/stylizedGrass";
import { Color4, FreeCamera, Texture } from "@babylonjs/core";
import { Imported } from "@shared/ImportedDecorator";
import { ImportedCamera, zodNumber } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class GrassGenerator extends CustomScriptComponent {
	@Imported(zodLodLevel, true) private _grassLodLevels! : LodLevel[];
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
	@Imported(RandomTerrainGenerator) private	_ground! : RandomTerrainGenerator;
	@Imported(zodNumber) private _grassInstanceCount! : number;
	@Imported(zodNumber) private _grassMaxDistance! : number;

	private	_grassLod! : Lod;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GrassGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{	
		this._grassLod = new Lod(this._grassLodLevels, this.scene);
		this.setAllGrassMaterials();
	}

	protected	start()
	{
		this.placeGrassInFrontOfCamera();
	}

	private	setAllGrassMaterials()
	{
		this._grassTexture.vScale = -1;
		this._grassLod.getLodLevels().forEach((lodLevel : LodLevelProcessed) => {
			this.setGrassMaterial(lodLevel.mesh);
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
	}

	private	placeGrassInFrontOfCamera()
	{
		const	aspectRatio = this.scene.getEngine().getAspectRatio(this._camera);
		const	baseForCircleUnit = Math.tan(this._camera.fov / 2) * 2 * aspectRatio;
		const	baseNear = baseForCircleUnit * this._camera.minZ;
		const	baseFar = baseForCircleUnit * this._grassMaxDistance;
		const	height = this._grassMaxDistance - this._camera.minZ;
		const	inverseMeshWorldMatrix = Matrix.Invert(this._grassLod.worldMatrix);

		for (let index = 0; index < this._grassInstanceCount; index++) {
			const	localPos2D = getRandomCoordinatesInTrapeze(baseNear, baseFar, height);
			const	localPos3D = new Vector3(localPos2D.x, -5, localPos2D.y + this._camera.minZ);
			const	globalPos3D = Vector3.TransformCoordinates(localPos3D, this._camera.worldMatrixFromCache);

			globalPos3D.y = this._ground.getHeightAtCoordinates(globalPos3D.x, globalPos3D.z);
			const	rotation = Quaternion.RotationAxis(Vector3.UpReadOnly, Math.random() * 2 * Math.PI);
			const	matrix = Matrix.Compose(Vector3.OneReadOnly, rotation, globalPos3D);

			const	invertedMatrix = matrix.multiply(inverseMeshWorldMatrix);
			const	squaredDistance = Vector3.DistanceSquared(this._camera.position, globalPos3D);
			const	lodLevel = this._grassLod.getLodLevel(squaredDistance);

			lodLevel?.thinInstanceAdd(invertedMatrix, false);
		}
		this.syncThinInstancesBuffer(this._grassLod);
	}

	private	syncThinInstancesBuffer(lod : Lod)
	{
		lod.getLodLevels().forEach((lodLevel : LodLevelProcessed) => {
			lodLevel.mesh.thinInstanceBufferUpdated("matrix");
			if (!lodLevel.mesh.doNotSyncBoundingInfo) {
				lodLevel.mesh.thinInstanceRefreshBoundingInfo(false);
			}
		});
	}
}

SceneManager.RegisterClass("GrassGenerator", GrassGenerator);
