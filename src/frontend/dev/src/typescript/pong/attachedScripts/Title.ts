import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Imported } from "@shared/ImportedDecorator";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { buildTitleMaterial } from "../shaders/titleShader";
import { zodNumber } from "@shared/ImportedHelpers";

export class Title extends CustomScriptComponent {
	@Imported(AbstractMesh) private _3Mesh! : AbstractMesh;
	@Imported(AbstractMesh) private _dMesh !: AbstractMesh;
	@Imported(zodNumber) private _speed! : number;
	@Imported(zodNumber) private _pixelSize! : number;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "Title") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	[ material, inputs ] = buildTitleMaterial("title", this.scene);

		inputs.speed.value = this._speed;
		inputs.pixelSize.value = this._pixelSize;

		this._3Mesh.material = material;
		this._dMesh.material = material;
	}
}

SceneManager.RegisterClass("Title", Title);
