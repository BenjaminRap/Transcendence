import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Range } from "./Range";

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
