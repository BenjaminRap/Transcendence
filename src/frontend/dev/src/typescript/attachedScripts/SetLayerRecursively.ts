import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";

export class SetLayerRecursively extends ScriptComponent {
	private _layerMask : number = 1;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "SetLayersRecursively") {
        super(transform, scene, properties, alias);
    }

    protected start(): void {
		this.transform.getChildMeshes(false).forEach((mesh : AbstractMesh, _index : number, _allChildsMeshes : AbstractMesh[]) => {
			mesh.layerMask = this._layerMask;
		});
    }
}

SceneManager.RegisterClass("SetLayerRecursively", SetLayerRecursively);
