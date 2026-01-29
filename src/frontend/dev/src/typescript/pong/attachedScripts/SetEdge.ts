import { Scene } from "@babylonjs/core/scene";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import zod from "zod";
import { Imported } from "@shared/ImportedDecorator";
import { zodColor } from "../ColorGradiant";
import { Color4 } from "@babylonjs/core";
import { zodNumber } from "@shared/ImportedHelpers";

const	zodEdge = zod.object({
	color : zodColor,
	width : zodNumber
});
type Edge = zod.infer<typeof zodEdge>;

export class SetEdge extends CustomScriptComponent {
	@Imported(zodEdge) private _edge! : Edge;
	@Imported(Mesh, true) private _meshes! : Mesh[];

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "SetEdge") {
        super(transform, scene, properties, alias);
    }

	protected	ready()
	{
		this._meshes.forEach(mesh => {
			mesh.enableEdgesRendering();
			mesh.edgesColor = new Color4(this._edge.color.r, this._edge.color.g, this._edge.color.b, this._edge.color.a);
			mesh.edgesWidth = this._edge.width;
		});
	}
}

SceneManager.RegisterClass("SetEdge", SetEdge);
