import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { type int } from "@babylonjs/core/types";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Range } from "../Range";
import { getRandomCoordinatesInTrapeze, randomFromRange } from "../utilities";
import { Lod, zodLodLevel, type LodLevelProcessed } from "../Lod";
import { RandomTerrainGenerator } from "./RandomTerrainGenerator";
import { Imported } from "@shared/ImportedDecorator";
import zod from "zod";
import { ImportedCamera, zodInt, zodNumber } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import type { FreeCamera } from "@babylonjs/core";

const zodRandomEnvironmentElement = zod.object({
	lodLevels: zod.array(zodLodLevel),
	instanceCount: zod.number().int()
});
type RandomEnvironmentElement = zod.infer<typeof zodRandomEnvironmentElement>;

export class RandomEnvironmentGenerator extends CustomScriptComponent {
	@Imported(zodInt) private _dimension! : int;
	@Imported(zodRandomEnvironmentElement, true) private _envElements! : RandomEnvironmentElement[];
	@Imported(zodNumber) private _instancesCountFactor! : number;
	@Imported(zodNumber) private _distanceWithoutElements! : number;
	@Imported(RandomTerrainGenerator) private _ground! : RandomTerrainGenerator;
	@ImportedCamera private _camera! : FreeCamera;

	private _elementsLods! : Lod[];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomEnvironmentGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	start()
	{
		this.populateEnvironment();
	}

	private populateEnvironment() : void
	{
		this._elementsLods = this._envElements.map((envElement) => new Lod(envElement.lodLevels, this.scene));

		this.instanciateAllEnvElements();
	}

	private instanciateAllEnvElements()
	{
		for (let index = 0; index < this._envElements.length; index++) {
			const	lod = this._elementsLods[index];
			const	instanceCount = this._envElements[index].instanceCount;

			this.instanciateEnvElement(lod, instanceCount);
		}
	}

	private instanciateEnvElement(lod : Lod, instanceCount : number)
	{
		const	aspectRatio = this.scene.getEngine().getAspectRatio(this._camera);
		const	baseForCircleUnit = Math.tan(this._camera.fov / 2) * 2 * aspectRatio;
		const	baseNear = baseForCircleUnit * this._camera.minZ;
		const	baseFar = baseForCircleUnit * this._dimension / 2;
		const	height = this._dimension / 2 - this._camera.minZ;
		const	inverseMeshWorldMatrix = Matrix.Invert(lod.worldMatrix);
		for (let i = 0; i < instanceCount * this._instancesCountFactor; i++) {
			const	position = this.getRandomPositionOnGround(baseNear, baseFar, height);

			if (position.length() < this._distanceWithoutElements)
				continue ;

			const	squaredDistance = Vector3.DistanceSquared(this.transform.position, position);
			const	lodLevel = lod.getLodLevel(squaredDistance);
			const	scale = lodLevel?.scaling ?? Vector3.OneReadOnly;
			const	rotation = Quaternion.RotationAxis(Vector3.UpReadOnly, Math.random() * 2 * Math.PI);
			const	matrix = Matrix.Compose(scale, rotation, position);
			const	invertedMatrix = matrix.multiply(inverseMeshWorldMatrix);

			lodLevel?.thinInstanceAdd(invertedMatrix, true)
		}
		this.syncThinInstancesBuffer(lod);
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

	private getRandomPositionOnGround(baseNear : number, baseFar : number, height : number) : Vector3
	{

		const	localPos2D = getRandomCoordinatesInTrapeze(baseNear, baseFar, height);
		const	localPos3D = new Vector3(localPos2D.x, -5, localPos2D.y + this._camera.minZ);
		const	globalPos3D = Vector3.TransformCoordinates(localPos3D, this._camera.worldMatrixFromCache);

		globalPos3D.y = this._ground.getHeightAtCoordinates(globalPos3D.x, globalPos3D.z);

		return globalPos3D;
	}
}

SceneManager.RegisterClass("RandomEnvironmentGenerator", RandomEnvironmentGenerator);
