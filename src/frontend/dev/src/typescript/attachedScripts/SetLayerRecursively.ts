import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";

export class SetLayerRecursively extends ScriptComponent {
	public layerMask : number = 1;
    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "SetLayersRecursively") {
        super(transform, scene, properties, alias);
    }

    protected start(): void {
		const meshes : AbstractMesh[] = this.transform.getChildMeshes();

		meshes.forEach((mesh : AbstractMesh) => {
			mesh.layerMask = this.layerMask;
		});
    }
}

SceneManager.RegisterClass("SetLayerRecursively", SetLayerRecursively);
