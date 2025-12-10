import type { Scene } from "@babylonjs/core";
import type { Material } from "@babylonjs/core/Materials/material";
import { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Range } from "@shared/Range";

export function randomFromRange(range : Range) : number
{
  return Math.random() * (range.max - range.min) + range.min;
}


const	square = (value : number) => Math.pow(value, 2);
const	sqrt = Math.sqrt;

export function	getRandomCoordinatesInTrapeze(baseNear : number, baseFar : number, height : number) : Vector2
{
	const	random = Math.random();
	const	yNumerator = -baseNear + sqrt(square(baseNear) + random * (square(baseFar) - square(baseNear)));
	const	yDenominator = (baseFar - baseNear) / height;
	const	y : number = yNumerator / yDenominator;
	const	widhAtZ = remap(y, 0, height, baseNear, baseFar);
	const	x : number = (Math.random() - 0.5) * widhAtZ;

	return new Vector2(x, y);
}

function	remap(value : number, min : number, max : number, newMin : number, newMax : number)
{
	return newMin + (newMax - newMin) * (value - min) / (max - min);
}

export function	getRandomWeightedIndex(weights : number[]) : number
{
	let	totalWeight = 0;
	const	weightsSteps = weights.map((value : number) => {
		totalWeight += value;
		return totalWeight;
	});
	const	random = Math.random() * totalWeight;

	for (let index = 0; index < weightsSteps.length; index++) {
		if (random <= weightsSteps[index])
			return index;
	}
	throw new Error("getRandomWeighted isn't working properly !");
}

export function	replaceMaterial(currentMaterial : Material, newMaterial : Material, scene : Scene)
{

	scene.meshes.forEach((mesh : AbstractMesh) => {
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

