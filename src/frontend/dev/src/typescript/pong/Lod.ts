import { Matrix } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";

export interface	LodLevel
{
	meshId : string;
	distance : number;
}

export interface	LodLevelProcessed
{
	mesh : Mesh;
	squaredDistance : number;
}

export class	Lod
{
	public readonly worldMatrix : Matrix;

	private	readonly _levels : readonly LodLevelProcessed[];

	constructor(lodLevels : LodLevel[], scene : Scene)
	{
		this._levels = this.getLodLevelsProcessed(lodLevels, scene);
		this.worldMatrix = this._levels[0].mesh.getWorldMatrix();
	}

	private	getLodLevelsProcessed(lodLevels : LodLevel[], scene : Scene)
	{
		if (lodLevels.length === 0)
			throw new Error("Lod created with 0 levels !");
		lodLevels.sort((a: LodLevel, b: LodLevel) => a.distance - b.distance);
		return lodLevels.map((lodLevel : LodLevel) => {
			const	mesh = scene.getMeshByName(lodLevel.meshId);

			if (mesh === null)
				console.error(`Can't find an lod mesh, id : ${lodLevel.meshId}!`);
			else if (!(mesh instanceof Mesh))
				console.error(`The lod AbstractMesh is not a Mesh, id :  ${lodLevel.meshId}`)
			else
			{
				return {
					mesh: mesh,
					squaredDistance: Math.pow(lodLevel.distance, 2)
				};
			}
			return null;
		}).filter((value) => value !== null);
	}

	public getLodLevels()
	{
		return this._levels;
	}

	public	getLod(squaredDistance : number) : Mesh | null
	{
		for (let index = 0; index < this._levels.length; index++) {
			const lodLevel = this._levels[index];
			
			if (squaredDistance < lodLevel.squaredDistance)
				return lodLevel.mesh;
		}
		return null;
	}
}
