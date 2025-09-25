import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { IUnityVector2, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { int } from "@babylonjs/core/types";
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Range } from "../Range";
import { randomFromRange } from "../utilities";

interface	RandomEnvironmentElement
{
	id : string;
	instanceCount : int;
}

export class RandomEnvironmentGenerator extends ScriptComponent {
	private _dimensions : IUnityVector2 = new Vector2(100, 100);
	private _envElements : RandomEnvironmentElement[] = [];
	private _instancesCountFactor : number = 1;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomEnvironmentGenerator") {
        super(transform, scene, properties, alias);
    }

	public populateEnvironment(ground : GroundMesh) : void
	{
		if (this._envElements.length === 0)
			return ;
		const	xPosRange = new Range(-this._dimensions.y / 2, this._dimensions.y / 2);
		const	yPosRange = new Range(-this._dimensions.x / 2, this._dimensions.x / 2);

		this.instanciateAllEnvElements(ground, xPosRange, yPosRange);
	}

	private instanciateAllEnvElements(ground : GroundMesh, xPosRange : Range, yPosRange : Range)
	{
		this._envElements.forEach((envElement : RandomEnvironmentElement) => {
			this.instanciateEnvElement(envElement, ground, xPosRange, yPosRange);
		});
	}

	private instanciateEnvElement(envElement : RandomEnvironmentElement, ground : GroundMesh, xPosRange : Range, yPosRange : Range)
	{
		const	mesh = this.scene.getNodeByName(envElement.id);

		if (!(mesh instanceof Mesh))
			throw new Error(`An EnvElement in the RandomEnvironmentGenerator script is not a mesh ! : ${mesh?.name}`);
		for (let i = 0; i < envElement.instanceCount * this._instancesCountFactor; i++) {
			const	position = this.getRandomPositionOnGround(ground, xPosRange, yPosRange);

			position.subtractInPlace(mesh.absolutePosition);
			const	matrix = Matrix.Translation(position.x, position.y, position.z);

			mesh.thinInstanceAdd(matrix, i === this._instancesCountFactor - 1);
		}
	}

	private getRandomPositionOnGround(ground : GroundMesh, xPosRange : Range, yPosRange : Range) : Vector3
	{
		const	position = new Vector3();

		position.x = randomFromRange(xPosRange);
		position.z = randomFromRange(yPosRange);
		position.y = ground.getHeightAtCoordinates(position.x, position.z);

		return position;
	}
}

SceneManager.RegisterClass("RandomEnvironmentGenerator", RandomEnvironmentGenerator);
