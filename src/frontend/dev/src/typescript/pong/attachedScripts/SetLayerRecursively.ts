import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { Imported } from "@shared/ImportedDecorator";
import type { int } from "@babylonjs/core";
import { zodInt } from "@shared/ImportedHelpers";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";

export class SetLayerRecursively extends CustomScriptComponent {
	@Imported(zodInt) private _layerMask! : int;

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
