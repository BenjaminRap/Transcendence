import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { float, int, ShaderMaterial, VertexBuffer } from "@babylonjs/core";
import { getDiamondSquareArray } from "../diamondSquareAlgorithm";
import { Range } from "../Range";

import defaultVertex from "/src/shaders/vertex/default.vert?raw";
import groundFragment from "/src/shaders/fragment/ground.frag?raw";

export class RandomTerrainGenerator extends ScriptComponent {
	private _width : float = 100;
	private _height : float = 100;
	private _subdivisionsFactor : int = 8;
	private _minHeight : float = 1;
	private _maxHeight : float = 16;
	private _minRandomness : float = -2;
	private _maxRandomness : float = 2;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomTerrtexture format babylonjsainGenerator") {
        super(transform, scene, properties, alias);
    }

	protected awake()
	{
		const	ground = this.createGroundGrid();
		this.setVerticesHeights(ground);
		this.setShader(ground);
		ground.parent = this.transform;
	}

	private createGroundGrid() : GroundMesh
	{
		const	subdivisions = 2 * this._subdivisionsFactor;
		const	ground = MeshBuilder.CreateGround("ground", {
			subdivisions: subdivisions,
			width: this._width,
			height: this._height,
			updatable: true
		}, this.scene);

		return ground;
	}

	private setVerticesHeights(ground : GroundMesh) : void
	{
		const	heightsRange = new Range(this._minHeight, this._maxHeight);
		const	randomnessRange = new Range(this._minRandomness, this._maxRandomness);
		const	heights = getDiamondSquareArray(this._subdivisionsFactor, heightsRange, randomnessRange);
		const	positions = ground.getVerticesData(VertexBuffer.PositionKind);
		if (!positions)
			throw new Error("Can not get the ground vertices data !");

		heights.forEach((value : number, index : number) => {
			positions[index * 3 + 1] = value;
		});

		ground.setVerticesData(VertexBuffer.PositionKind, positions, true);
	}

	private setShader(ground : GroundMesh)
	{
		ground.material = new ShaderMaterial("ground", this.scene, {
			vertexSource : defaultVertex,
			fragmentSource: groundFragment
		},
		{
			attributes: [ "position" ],
			uniforms: [ "worldViewProjection" ],
		});
	}
}

SceneManager.RegisterClass("RandomTerrainGenerator", RandomTerrainGenerator);
