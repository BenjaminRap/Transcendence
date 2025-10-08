import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { buildGrassMaterial } from "../shaders/grass";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getRandomCoordinatesInTrapeze } from "../utilities";
import { RandomTerrainGenerator } from "./RandomTerrainGenerator";

export class GrassGenerator extends ScriptComponent {
	private _grassMesh! : Mesh;
	private _cameraTransform! : TransformNode & { camera: Camera };
	private	_ground! : TransformNode & { randomTerrainGenerator : RandomTerrainGenerator}
	private _grassInstanceCount : number = 100;
	private _grassMaxDistance : number = 5;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GrassGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{	
		this.initAttributes();
		this.setGrassMaterial();
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

	private	setGrassMaterial()
	{
		const	[material, _inputs] = buildGrassMaterial("grass", this.scene);

		this._grassMesh.material = material;
	}

	private	placeGrassInFrontOfCamera()
	{
		const	camera = this._cameraTransform.camera;
		const	aspectRatio = this.scene.getEngine().getAspectRatio(camera);
		const	baseForCircleUnit = Math.tan(camera.fov / 2) * 2 * aspectRatio;
		const	baseNear = baseForCircleUnit * camera.minZ;
		const	baseFar = baseForCircleUnit * this._grassMaxDistance;
		const	height = this._grassMaxDistance - camera.minZ;
		const	inverseMeshWorldMatrix = Matrix.Invert(this._grassMesh.worldMatrixFromCache);

		for (let index = 0; index < this._grassInstanceCount; index++) {
			const	localPos2D = getRandomCoordinatesInTrapeze(baseNear, baseFar, height);
			const	localPos3D = new Vector3(localPos2D.x, -5, localPos2D.y + camera.minZ);
			const	globalPos3D = Vector3.TransformCoordinates(localPos3D, camera.worldMatrixFromCache);

			globalPos3D.y = this._ground.randomTerrainGenerator.getHeightAtCoordinates(globalPos3D.x, globalPos3D.z);
			const	rotation = Quaternion.RotationAxis(Vector3.UpReadOnly, Math.random() * 2 * Math.PI);
			const	matrix = Matrix.Compose(Vector3.OneReadOnly, rotation, globalPos3D);

			const	invertedMatrix = matrix.multiply(inverseMeshWorldMatrix);
			const	updateInstanceBuffer = index === this._grassInstanceCount - 1;
			this._grassMesh.thinInstanceAdd(invertedMatrix, updateInstanceBuffer);
		}
	}
}

SceneManager.RegisterClass("GrassGenerator", GrassGenerator);
