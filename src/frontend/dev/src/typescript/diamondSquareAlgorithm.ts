import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { int } from "@babylonjs/core/types";
import { Range } from "./Range";
import { Float32Array2D } from "./Float32Array2D";
import { randomFromRange } from "./utilities";

export function getDiamondSquareArray(sizeFactor : int, heightRange : Range, randomnessRange : Range) : Float32Array
{
	const	size : int = 2 * sizeFactor + 1;
	const	array2D = new Float32Array2D(size, size);

	let	squareSize : int = size - 1;

	setCornersRandomly(array2D, heightRange);
	while (squareSize !== 1)
	{
		squareStepLoop(array2D, randomnessRange, squareSize);
		diamondStepLoop(array2D, randomnessRange, squareSize);
		squareSize /= 2;
		randomnessRange.min /= 2;
		randomnessRange.max /= 2;
	}
	return array2D.get1DArray();
}

function	squareStepLoop(array2D : Float32Array2D, randomnessRange : Range, squareSize : int) : void
{
	const	halfSquareSize = squareSize / 2;

	for (let x = halfSquareSize; x < array2D.width; x += squareSize)
	{
		for (let y = halfSquareSize; y < array2D.height; y += squareSize)
		{
			let	sum = 0;
			foreachCorners(x, y, halfSquareSize, (cornerX : int, cornerY : int) => {
				sum += array2D.get(cornerX, cornerY);
			})
			const	average = sum / 4;
			array2D.set(x, y, average + randomFromRange(randomnessRange));
		}
	}
}

function	diamondStepLoop(array2D : Float32Array2D, randomnessRange : Range, squareSize : int) : void
{
	const	halfSquareSize = squareSize / 2;

	for (let x = 0; x < array2D.width; x += halfSquareSize)
	{
		const	isEvenColumn : boolean = (x / halfSquareSize) % 2 == 0;

		for (let y = isEvenColumn ? halfSquareSize : 0; y < array2D.height; y += squareSize)
		{
			let	sum = 0;
			let	sideCount = 0;

			foreachSides(x, y, halfSquareSize, (cornerX : int, cornerY : int) => {
				if (array2D.isInBounds(cornerX, cornerY))
				{
					sum += array2D.get(cornerX, cornerY);
					sideCount++;
				}
			})
			const	average = sum / sideCount;
			array2D.set(x, y, average + randomFromRange(randomnessRange));
		}
	}
}

function	setCornersRandomly(array2D : Float32Array2D, heightRange : Range) : void
{
	const	halfSize = (array2D.width - 1) / 2;

	foreachCorners(halfSize, halfSize, halfSize, (cornerX : int, cornerY : int) => {
		array2D.set(cornerX, cornerY, randomFromRange(heightRange))
	});
}

function	foreachCorners(x : int, y : int, halfSquareSize : int, callback : (cornerX : int, cornerY : int) => void) : void
{
	corners.forEach((relativeCoords : Vector2) => {
		const	cornerX = relativeCoords.x * halfSquareSize + x;
		const	cornerY = relativeCoords.y * halfSquareSize + y;

		callback(cornerX, cornerY);	
	});
}

const	corners = [
	new Vector2(-1, -1),
	new Vector2(-1, 1),
	new Vector2(1, 1),
	new Vector2(1, -1)
] as const;

function	foreachSides(x : int, y : int, halfSquareSize : int, callback : (sideX : int, sideY : int) => void) : void
{
	sides.forEach((relativeCoords : Vector2) => {
		const	sideX = relativeCoords.x * halfSquareSize + x;
		const	sideY = relativeCoords.y * halfSquareSize + y;

		callback(sideX, sideY);	
	});
}

const	sides = [
	new Vector2(0, 1),
	new Vector2(0, -1),
	new Vector2(1, 0),
	new Vector2(-1, 0)
] as const;
