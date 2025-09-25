import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";

import { buildGrassMaterial } from "../shaders/grass";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { getHorizontalFOV, getRandomCoordinatesInTrapeze } from "../utilities";

export class GrassGenerator extends ScriptComponent {
	private _grassTransform! : IUnityTransform & { mesh : Mesh};
	private _cameraTransform! : IUnityTransform & { camera : Camera, transform : TransformNode };
	private _grassInstanceCount : number = 100;
	private _grassMaxDistance : number = 5;

	private static readonly _horizontalFOVMarginInRadian : number = 0.2;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GrassGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{	
		this.initAttributes();
		this.setGrassMaterial();
		this.placeGrassInFrontOfCamera();
	}

	private	initAttributes()
	{
		const	grassMesh = SceneManager.GetTransformNodeByID(this.scene, this._grassTransform.id);

		if (!(grassMesh instanceof Mesh))
			throw new Error("the _grassMesh transform is not a mesh !!");
		this._grassTransform.mesh = grassMesh;

		this._cameraTransform.transform = SceneManager.GetTransformNodeByID(this.scene, this._cameraTransform.id);
		this._cameraTransform.camera = SceneManager.FindSceneCameraRig(this._cameraTransform.transform);
		if (this._cameraTransform.camera === null)
			throw new Error("the _cameraTransform transform is not a Camera !!");
	}

	private	setGrassMaterial()
	{
		const	[material, _inputs] = buildGrassMaterial("grass", this.scene);

		this._grassTransform.mesh.material = material;
	}

	private	placeGrassInFrontOfCamera()
	{
		const	camera = this._cameraTransform.camera;
		const	aspectRatio = this.scene.getEngine().getAspectRatio(camera);
		const	horizontalFOV = getHorizontalFOV(camera.fov, aspectRatio) + GrassGenerator._horizontalFOVMarginInRadian;
		const	baseForCircleUnit = Math.tan(horizontalFOV / 2) * 2;
		const	baseNear = baseForCircleUnit * camera.minZ;
		const	baseFar = baseForCircleUnit * this._grassMaxDistance;
		const	height = this._grassMaxDistance - camera.minZ;

		for (let index = 0; index < this._grassInstanceCount; index++) {
			const	localPos2D = getRandomCoordinatesInTrapeze(baseNear, baseFar, height);
			const	localPos3D = new Vector3(localPos2D.x, -5, localPos2D.y + camera.minZ);

			localPos3D.subtractInPlace(this._grassTransform.mesh.absolutePosition);
			const	globalPos3D = Vector3.TransformCoordinates(localPos3D, camera.getWorldMatrix());

			const	matrix = Matrix.Translation(globalPos3D.x, globalPos3D.y, globalPos3D.z);
			this._grassTransform.mesh.thinInstanceAdd(matrix, true);
		}
	}
}

SceneManager.RegisterClass("GrassGenerator", GrassGenerator);
