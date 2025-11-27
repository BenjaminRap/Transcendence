import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { float, int, Material, Scalar, VertexBuffer } from "@babylonjs/core";
import { getDiamondSquareArray } from "../diamondSquareAlgorithm";
import { Range } from "../Range";

import { Float32Array2D } from "../Float32Array2D";
import { RandomEnvironmentGenerator } from "./RandomEnvironmentGenerator";

export class RandomTerrainGenerator extends ScriptComponent {
	private _dimension : number = 100;
	private _subdivisionsFactor : int = 8;
	private _heightRange : Range = new Range(1, 16);
	private _randomnessRange : Range = new Range(-2, 2);
	private _groundMaterial! : Material;
	private _flattenHeightDistance : number = 20;
	private _flattenHeightTransitionDistance : number = 100;

	private _ground! : GroundMesh;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomTerrainGenerator") {
        super(transform, scene, properties, alias);
    }

	protected awake()
	{
		this._ground = this.createGroundGrid();
		this._ground.receiveShadows = true;
		const	heights = this.getVerticesHeights();
		this.setVerticesPositions(heights);
		this._ground.position.y -= this._ground.getHeightAtCoordinates(this._ground.absolutePosition.x, this._ground.position.z);
		this._ground.material = this._groundMaterial;
	}

	private createGroundGrid() : GroundMesh
	{
		const	subdivisions = 2 * this._subdivisionsFactor;
		const	ground = MeshBuilder.CreateGround("ground", {
			subdivisions: subdivisions,
			width: this._dimension,
			height: this._dimension,
			updatable: true
		}, this.scene);

		ground.parent = this.transform;
		return ground;
	}

	private getVerticesHeights() : Float32Array2D
	{
		const	heightsRange = new Range(this._heightRange.min, this._heightRange.max);
		const	randomnessRange = new Range(this._randomnessRange.min, this._randomnessRange.max);
		const	heights = getDiamondSquareArray(this._subdivisionsFactor, heightsRange, randomnessRange);

		return heights;
	}

	private setVerticesPositions(heights : Float32Array2D) : void
	{
		const	positions = this._ground.getVerticesData(VertexBuffer.PositionKind);

		if (!positions)
			throw new Error("Can not get the ground vertices data !");
		const	heightAverage = this.getAverageHeightInCircle(heights);
		heights.forEach((value : number, _x : int, _y : int, index : number) => {
			const xWorld = positions[index * 3];
			const zWorld = positions[index * 3 + 2]; 
			const flattenedHeight = this.flattenHeight(value, xWorld, zWorld, heightAverage)

			positions[index * 3 + 1] = flattenedHeight;
		});
		this._ground.setVerticesData(VertexBuffer.PositionKind, positions, true);
		this._ground.updateCoordinateHeights();
	}

	private getAverageHeightInCircle(heights : Float32Array2D) : float
	{
		const centerX = heights.width / 2;
		const centerY = heights.height / 2;
		const radius = Math.round(this._flattenHeightTransitionDistance * 2 * this._subdivisionsFactor / this._dimension);
		let sum : float = 0;
		let summedCount : int = 0;

		for (let y = -radius; y < radius + 1; y++)
		{
			const halfWidth : float = Math.sqrt(Math.pow(radius + 0.5, 2) - Math.pow(y, 2));
			const roundedHalfWidth : int = Math.round(halfWidth);

			for (let x = -roundedHalfWidth; x < roundedHalfWidth + 1; x++)
			{
				sum += heights.get(centerX + x, centerY + y);
				summedCount++;
			}
		}
		if (summedCount == 0)
			return 0;
		const average : float = sum / summedCount;

		return average;
	}

	private	flattenHeight(value : number, x : int, z : int, heightInMiddle : number) : number
	{
		const	min  = this._flattenHeightDistance;
		const	max = this._flattenHeightTransitionDistance;
		const	distance = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));
		if (distance < min)
			return heightInMiddle;
		if (distance > max)
			return value;
		const distancePercent = (distance - min) / (max - min);
		const newValue = Scalar.Lerp(heightInMiddle, value, distancePercent);

		return newValue;
	}

	public	getHeightAtCoordinates(x : number, y : number) : number
	{
		if (this._ground === undefined)
			return 0;
		if (Math.abs(x) > this._dimension / 2
			|| Math.abs(y) > this._dimension / 2)
		{
			return 0;
		}
		return this._ground.getHeightAtCoordinates(x, y);
	}
}

SceneManager.RegisterClass("RandomTerrainGenerator", RandomTerrainGenerator);
