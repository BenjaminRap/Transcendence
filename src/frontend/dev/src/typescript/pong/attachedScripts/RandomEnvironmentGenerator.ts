import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { type int } from "@babylonjs/core/types";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Range } from "../Range";
import { randomFromRange } from "../utilities";
import { Lod, zodLodLevel, type LodLevelProcessed } from "../Lod";
import { RandomTerrainGenerator } from "./RandomTerrainGenerator";
import { Imported } from "@shared/ImportedDecorator";
import zod from "zod";
import { zodInt, zodNumber } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import type { MultiMaterial } from "@babylonjs/core";

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
	@Imported(TransformNode) private _ground! : TransformNode;

	private _elementsLods! : Lod[];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomEnvironmentGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	start()
	{
		const	ground = SceneManager.GetComponent<RandomTerrainGenerator>(this._ground, "RandomTerrainGenerator", false);

		this.populateEnvironment(ground);
	}

	private populateEnvironment(ground : RandomTerrainGenerator) : void
	{
		this._elementsLods = this._envElements.map((envElement) => new Lod(envElement.lodLevels, this.scene));
		const	posRange = new Range(-this._dimension / 2, this._dimension / 2);

		this.instanciateAllEnvElements(ground, posRange);
	}

	private instanciateAllEnvElements(ground : RandomTerrainGenerator, posRange : Range)
	{
		for (let index = 0; index < this._envElements.length; index++) {
			this.instanciateEnvElement(index, ground, posRange);
		}
	}

	private instanciateEnvElement(index : int, ground : RandomTerrainGenerator, posRange : Range)
	{
		const	lod = this._elementsLods[index];
		const	instanceCount = this._envElements[index].instanceCount;

		const	inverseMeshWorldMatrix = Matrix.Invert(lod.worldMatrix);
		for (let i = 0; i < instanceCount * this._instancesCountFactor; i++) {
			const	position = this.getRandomPositionOnGround(ground, posRange);

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

	private getRandomPositionOnGround(ground : RandomTerrainGenerator, posRange : Range) : Vector3
	{
		const	position = new Vector3();

		position.x = randomFromRange(posRange);
		position.z = randomFromRange(posRange);
		position.addInPlace(ground.transform.absolutePosition);

		position.y = ground.getHeightAtCoordinates(position.x, position.z);

		return position;
	}
}

SceneManager.RegisterClass("RandomEnvironmentGenerator", RandomEnvironmentGenerator);
