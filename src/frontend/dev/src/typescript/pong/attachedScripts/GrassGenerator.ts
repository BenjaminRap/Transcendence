import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Matrix, Quaternion, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getRandomCoordinatesInTrapeze } from "../utilities";
import { RandomTerrainGenerator } from "./RandomTerrainGenerator";
import { Lod, LodLevel, LodLevelProcessed } from "../Lod";
import { buildStylizedGrassMaterial } from "../shaders/stylizedGrass";
import { Color3, Texture } from "@babylonjs/core";

export class GrassGenerator extends ScriptComponent {
	private _grassLodLevels! : LodLevel[];
	private _cameraTransform! : TransformNode & { camera: Camera };
	private _grassTexture! : Texture;
	private _bottomColor! : Color3;
	private _nearColor! : Color3;
	private _farColor! : Color3;
	private _windSpeed! : number;
	private _windDirection! : Vector3;
	private _windSwayScale! : number;
	private _windSwaySpeed! : number;
	private _windSwayContrast! : Vector2;
	private _windSwayDirection! : Vector3;
	private _swayColor! : Color3;
	private	_ground! : TransformNode & { randomTerrainGenerator : RandomTerrainGenerator}
	private _grassInstanceCount : number = 100;
	private _grassMaxDistance : number = 5;

	private	_grassLod! : Lod;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GrassGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{	
		this._grassLod = new Lod(this._grassLodLevels, this.scene);
		this.initAttributes();
		this.setAllGrassMaterials();
	}

	protected	start()
	{
		this.placeGrassInFrontOfCamera();
	}

	private	initAttributes()
	{
		this._cameraTransform.camera = SceneManager.FindSceneCameraRig(this._cameraTransform);
		if (this._cameraTransform.camera === null)
			throw new Error("the _cameraTransform is not a Camera !!");
		this._ground.randomTerrainGenerator = SceneManager.GetComponent(this._ground, "RandomTerrainGenerator", false);
	}

	private	setAllGrassMaterials()
	{
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
		const	near = this._cameraTransform.camera.minZ;
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
		_inputs.windSwayContrast.value = this._windSwayContrast;
		_inputs.windSwayDirection.value = this._windSwayDirection;
		_inputs.swayColor.value = this._swayColor;
	}

	private	placeGrassInFrontOfCamera()
	{
		const	camera = this._cameraTransform.camera;
		const	aspectRatio = this.scene.getEngine().getAspectRatio(camera);
		const	baseForCircleUnit = Math.tan(camera.fov / 2) * 2 * aspectRatio;
		const	baseNear = baseForCircleUnit * camera.minZ;
		const	baseFar = baseForCircleUnit * this._grassMaxDistance;
		const	height = this._grassMaxDistance - camera.minZ;
		const	inverseMeshWorldMatrix = Matrix.Invert(this._grassLod.worldMatrix);

		for (let index = 0; index < this._grassInstanceCount; index++) {
			const	localPos2D = getRandomCoordinatesInTrapeze(baseNear, baseFar, height);
			const	localPos3D = new Vector3(localPos2D.x, -5, localPos2D.y + camera.minZ);
			const	globalPos3D = Vector3.TransformCoordinates(localPos3D, camera.worldMatrixFromCache);

			globalPos3D.y = this._ground.randomTerrainGenerator.getHeightAtCoordinates(globalPos3D.x, globalPos3D.z);
			const	rotation = Quaternion.RotationAxis(Vector3.UpReadOnly, Math.random() * 2 * Math.PI);
			const	matrix = Matrix.Compose(Vector3.OneReadOnly, rotation, globalPos3D);

			const	invertedMatrix = matrix.multiply(inverseMeshWorldMatrix);
			const	squaredDistance = Vector3.DistanceSquared(this._cameraTransform.absolutePosition, globalPos3D);
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
