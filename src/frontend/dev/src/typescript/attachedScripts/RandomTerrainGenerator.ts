import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { IUnityMaterial, IUnityVector2, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { int, Vector2, VertexBuffer } from "@babylonjs/core";
import { getDiamondSquareArray } from "../diamondSquareAlgorithm";
import { Range } from "../Range";

import { Float32Array2D } from "../Float32Array2D";
import { RandomEnvironmentGenerator } from "./RandomEnvironmentGenerator";

export class RandomTerrainGenerator extends ScriptComponent {
	private _dimensions : IUnityVector2 = new Vector2(100, 100);
	private _subdivisionsFactor : int = 8;
	private _heightRange : Range = new Range(1, 16);
	private _randomnessRange : Range = new Range(-2, 2);
	private _groundMaterial! : IUnityMaterial;

	private _ground! : GroundMesh;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomTerrainGenerator") {
        super(transform, scene, properties, alias);
    }

	protected awake()
	{
		this._ground = this.createGroundGrid();
		const	heights = this.getVerticesHeights();
		this.setVerticesPositions(heights);
		this._ground.position.y -= this._ground.getHeightAtCoordinates(0, 0);

		this.setMaterial();
	}

	protected	start()
	{
		this.getComponents<RandomEnvironmentGenerator>("RandomEnvironmentGenerator", false).forEach((randomEnvironmentGenerator) => {
			randomEnvironmentGenerator.populateEnvironment(this._ground);
		});
	}

	private createGroundGrid() : GroundMesh
	{
		const	subdivisions = 2 * this._subdivisionsFactor;
		const	ground = MeshBuilder.CreateGround("ground", {
			subdivisions: subdivisions,
			width: this._dimensions.y,
			height: this._dimensions.x,
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
		heights.forEach((value : number, _x : int, _y : int, index : number) => {
			positions[index * 3 + 1] = value;
		});
		this._ground.setVerticesData(VertexBuffer.PositionKind, positions, true);
		this._ground.updateCoordinateHeights();
	}

	private setMaterial()
	{
		this._ground.material = this.scene.getMaterialById(this._groundMaterial.id);
	}
}

SceneManager.RegisterClass("RandomTerrainGenerator", RandomTerrainGenerator);
