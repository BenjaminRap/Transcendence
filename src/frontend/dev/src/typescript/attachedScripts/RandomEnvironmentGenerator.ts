import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { int } from "@babylonjs/core/types";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Range } from "../Range";
import { randomFromRange } from "../utilities";

interface	RandomEnvironmentElement
{
	id : string;
	instanceCount : int;
}

export class RandomEnvironmentGenerator extends ScriptComponent {
	private _dimension : number = 100;
	private _envElements : RandomEnvironmentElement[] = [];
	private _instancesCountFactor : number = 1;
	private _distanceWithoutElements : number = 10;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomEnvironmentGenerator") {
        super(transform, scene, properties, alias);
    }

	public populateEnvironment(ground : GroundMesh) : void
	{
		if (this._envElements.length === 0)
			return ;
		const	posRange = new Range(-this._dimension / 2, this._dimension / 2);

		this.instanciateAllEnvElements(ground, posRange);
	}

	private instanciateAllEnvElements(ground : GroundMesh, posRange : Range)
	{
		this._envElements.forEach((envElement : RandomEnvironmentElement) => {
			this.instanciateEnvElement(envElement, ground, posRange);
		});
	}

	private instanciateEnvElement(envElement : RandomEnvironmentElement, ground : GroundMesh, posRange : Range)
	{
		const	mesh = this.scene.getNodeByName(envElement.id);

		if (!(mesh instanceof Mesh))
			throw new Error(`An EnvElement in the RandomEnvironmentGenerator script is not a mesh ! : ${mesh?.name}`);
		for (let i = 0; i < envElement.instanceCount * this._instancesCountFactor; i++) {
			const	position = this.getRandomPositionOnGround(ground, posRange);
			if (position.length() < this._distanceWithoutElements)
				continue ;

			position.subtractInPlace(mesh.absolutePosition);
			const	matrix = Matrix.Translation(position.x, position.y, position.z);

			mesh.thinInstanceAdd(matrix, i === this._instancesCountFactor - 1);
		}
	}

	private getRandomPositionOnGround(ground : GroundMesh, posRange : Range) : Vector3
	{
		const	position = new Vector3();

		position.x = randomFromRange(posRange);
		position.z = randomFromRange(posRange);
		position.y = ground.getHeightAtCoordinates(position.x, position.z);

		return position;
	}
}

SceneManager.RegisterClass("RandomEnvironmentGenerator", RandomEnvironmentGenerator);
