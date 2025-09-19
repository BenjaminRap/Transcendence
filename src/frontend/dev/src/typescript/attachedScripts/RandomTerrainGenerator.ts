import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, Mesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { IUnityMaterial, IUnityTransform, IUnityVector2, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { int, Matrix, Vector2, Vector3, VertexBuffer } from "@babylonjs/core";
import { getDiamondSquareArray } from "../diamondSquareAlgorithm";
import { Range } from "../Range";

import defaultVertex from "/src/shaders/vertex/default.vert?raw";
import groundFragment from "/src/shaders/fragment/ground.frag?raw";
import { randomFromRange } from "../utilities";
import { Float32Array2D } from "../Float32Array2D";

export class RandomTerrainGenerator extends ScriptComponent {
	private _dimensions : IUnityVector2 = new Vector2(100, 100);
	private _subdivisionsFactor : int = 8;
	private _heightRange : Range = new Range(1, 16);
	private _randomnessRange : Range = new Range(-2, 2);
	private _envElements : (IUnityTransform & { mesh : Mesh })[] = [];
	private _envElementsInstanceCount : int = 100;
	private _groundMaterial! : IUnityMaterial;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomTerrainGenerator") {
        super(transform, scene, properties, alias);
    }

	protected awake()
	{
		const	ground = this.createGroundGrid();
		const	heights = this.getVerticesHeights();
		this.setVerticesPositions(ground, heights);
		const	heightAtMiddle = this.getGroundHeight(Vector2.Zero(), heights);
		ground.position.y -= heightAtMiddle;

		this.setShader(ground);
		this.populateEnvironment(heights, ground);
	}

	private populateEnvironment(heights : Float32Array2D, ground : GroundMesh) : void
	{
		if (this._envElements.length === 0)
			return ;
		this._envElements.forEach((envElement) => {
			const	elementTransform = SceneManager.GetTransformNodeByID(this.scene, envElement.id);

			if (!(elementTransform instanceof Mesh))
				throw new Error("The environment element doesn't have an associated mesh !");
			envElement.mesh = elementTransform;
		});
		const	meshIndexRange = new Range(0, this._envElements.length);
		const	xPosRange = new Range(-this._dimensions.y / 2, this._dimensions.y / 2);
		const	yPosRange = new Range(-this._dimensions.x / 2, this._dimensions.x / 2);

		for (let i = 0; i < this._envElementsInstanceCount; i++) {
			const	meshIndex = Math.floor(randomFromRange(meshIndexRange));
			const	mesh = this._envElements[meshIndex].mesh;
			const	position = new Vector3();

			position.x = randomFromRange(xPosRange) + ground.position.x;
			position.z = randomFromRange(yPosRange) + ground.position.z;
			position.y = this.getGroundHeight(new Vector2(position.x, -position.z), heights) + ground.position.y;
			mesh.thinInstanceAdd(Matrix.Translation(position.x, position.y, position.z));
		}
	}

	private getGroundHeight(relativePos : Vector2, heights : Float32Array2D)
	{
		if (relativePos.x < -this._dimensions.y / 2 || relativePos.x > this._dimensions.y / 2
			|| relativePos.y < -this._dimensions.x / 2 || relativePos.y > this._dimensions.x / 2)
		{
			throw new Error("The position isn't on the ground !");
		}
		let	gridPos = relativePos;
		gridPos.x += this._dimensions.y / 2;
		gridPos.y += this._dimensions.x / 2;

		const	gridSize = 2 * this._subdivisionsFactor;
		gridPos.x = gridSize * gridPos.x / this._dimensions.y;
		gridPos.y = gridSize * gridPos.y / this._dimensions.x;

		return this.getTriangleAverageHeight(gridPos, heights);
	}

	private getTriangleAverageHeight(pointInTriangle : Vector2, heights : Float32Array2D)
	{
		const cornerUpLeftX = Math.floor(pointInTriangle.x);
		const cornerUpLeftY = Math.floor(pointInTriangle.y);

		const	cornerUpLeftHeight = heights.get(cornerUpLeftX, cornerUpLeftY);
		const	cornerUpRightHeight = heights.get(cornerUpLeftX + 1, cornerUpLeftY);
		const	cornerDownLeftHeight = heights.get(cornerUpLeftX, cornerUpLeftY + 1);
		const	cornerDownRightHeight = heights.get(cornerUpLeftX + 1, cornerUpLeftY + 1);

		const	dx = pointInTriangle.x - cornerUpLeftX;
		const	dy = pointInTriangle.y - cornerUpLeftY;
		const	isUpRightTriangle : boolean = dx > dy;

		let		sum = cornerUpLeftHeight + cornerDownRightHeight;
		if (isUpRightTriangle)
			sum += cornerUpRightHeight;
		else
			sum += cornerDownLeftHeight;
		const	average = sum / 3;

		return average;
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

	private setVerticesPositions(ground : GroundMesh, heights : Float32Array2D) : void
	{
		const	positions = ground.getVerticesData(VertexBuffer.PositionKind);

		if (!positions)
			throw new Error("Can not get the ground vertices data !");
		heights.forEach((value : number, _x : int, _y : int, index : number) => {
			positions[index * 3 + 1] = value;
		});
		ground.setVerticesData(VertexBuffer.PositionKind, positions, true);
	}

	private setShader(ground : GroundMesh)
	{
		// ground.material = new ShaderMaterial("ground", this.scene, {
		// 	vertexSource : defaultVertex,
		// 	fragmentSource: groundFragment
		// },
		// {
		// 	attributes: [ "position" ],
		// 	uniforms: [ "worldViewProjection" ],
		// });
		ground.material = this.scene.getMaterialById(this._groundMaterial.id);
	}
}

SceneManager.RegisterClass("RandomTerrainGenerator", RandomTerrainGenerator);
