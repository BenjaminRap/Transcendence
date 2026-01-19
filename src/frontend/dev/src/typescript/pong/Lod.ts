import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { PongError } from "@shared/pongError/PongError";
import zod from "zod";

export const zodLodLevel = zod.object({
	meshName: zod.string().nonempty().nullable(),
	distance: zod.number().positive()
});

export type LodLevel = zod.infer<typeof zodLodLevel>;

export interface	LodLevelProcessed
{
	mesh : Mesh | null;
	squaredDistance : number;
}

export class	Lod
{
	private	readonly _levels : readonly LodLevelProcessed[];

	constructor(lodLevels : LodLevel[], scene : Scene)
	{
		this._levels = this.getLodLevelsProcessed(lodLevels, scene);
	}

	private	getLodLevelsProcessed(lodLevels : LodLevel[], scene : Scene)
	{
		if (lodLevels.length === 0)
			throw new PongError("Lod created with 0 levels !", "quitScene");
		lodLevels.sort((a: LodLevel, b: LodLevel) => a.distance - b.distance);
		return lodLevels.map((lodLevel : LodLevel) => {
			const	mesh = lodLevel.meshName ? this.findMesh(scene, lodLevel.meshName) : null;
			return {
				mesh: mesh,
				squaredDistance: Math.pow(lodLevel.distance, 2)
			};
		});
	}

	private	findMesh(scene : Scene, name : string) : Mesh
	{
		const	mesh = scene.getMeshByName(name);

		if (mesh === null)
			throw new PongError(`Can't find an lod mesh, id : ${name}!`, "quitScene");
		if (!(mesh instanceof Mesh))
			throw new PongError(`The lod AbstractMesh is not a Mesh, id :  ${name}`, "quitScene");

		return mesh;
	}

	public getLodLevels()
	{
		return this._levels;
	}

	public	getLodLevel(squaredDistance : number) : Mesh | null
	{
		for (let index = 0; index < this._levels.length; index++) {
			const lodLevel = this._levels[index];
			
			if (squaredDistance < lodLevel.squaredDistance)
				return lodLevel.mesh;
		}
		return null;
	}
}
