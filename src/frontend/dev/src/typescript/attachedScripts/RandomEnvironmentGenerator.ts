import { Scene } from "@babylonjs/core/scene";
import { GroundMesh, Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, IUnityVector2, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { int } from "@babylonjs/core/types";
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Range } from "../Range";
import { randomFromRange } from "../utilities";

export class RandomEnvironmentGenerator extends ScriptComponent {
	private _dimensions : IUnityVector2 = new Vector2(100, 100);
	private _envElements : (IUnityTransform & { mesh : Mesh })[] = [];
	private _envElementsInstanceCount : int = 100;
	private _placeEnvElementsRef : boolean = true;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "RandomEnvironmentGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		this._envElements.forEach((envElement) => {
			const	elementTransform = SceneManager.GetTransformNodeByID(this.scene, envElement.id);

			if (!(elementTransform instanceof Mesh))
				throw new Error("The environment element doesn't have an associated mesh !");
			envElement.mesh = elementTransform;
		});
	}

	public populateEnvironment(ground : GroundMesh) : void
	{
		if (this._envElements.length === 0)
			return ;
		const	xPosRange = new Range(-this._dimensions.y / 2, this._dimensions.y / 2);
		const	yPosRange = new Range(-this._dimensions.x / 2, this._dimensions.x / 2);

		if (this._placeEnvElementsRef)
			this.placeEnvElementsRef(ground, xPosRange, yPosRange);
		this.instanciateEnvElements(ground, xPosRange, yPosRange);
	}

	private placeEnvElementsRef(ground : GroundMesh, xPosRange : Range, yPosRange : Range)
	{
		this._envElements.forEach((envElement) => {
			envElement.mesh.position = this.getRandomPositionOnGround(ground, xPosRange, yPosRange);
		});
	}

	private instanciateEnvElements(ground : GroundMesh, xPosRange : Range, yPosRange : Range)
	{
		const	meshIndexRange = new Range(0, this._envElements.length);

		for (let i = 0; i < this._envElementsInstanceCount; i++) {
			const	meshIndex = Math.floor(randomFromRange(meshIndexRange));
			const	mesh = this._envElements[meshIndex].mesh;
			const	position = this.getRandomPositionOnGround(ground, xPosRange, yPosRange);

			position.subtractInPlace(mesh.position);
			const	matrix = Matrix.Translation(position.x, position.y, position.z);

			mesh.thinInstanceAdd(matrix);
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
