import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { IUnityTransform, SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";

import { buildGrassMaterial } from "../shaders/grass";

export class GrassGenerator extends ScriptComponent {
	private _grassTransform! : IUnityTransform & { mesh : Mesh};

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "GrassGenerator") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{	
		const	grassMesh = SceneManager.GetTransformNodeByID(this.scene, this._grassTransform.id);

		if (!(grassMesh instanceof Mesh))
			throw new Error("the _grassMesh transform is not a mesh !!");
		this._grassTransform.mesh = grassMesh;
		this.setGrassMaterial();
	}

	private	setGrassMaterial()
	{
		const	[material, _inputs] = buildGrassMaterial("grass", this.scene);

		this._grassTransform.mesh.material = material;
	}
}


SceneManager.RegisterClass("GrassGenerator", GrassGenerator);
