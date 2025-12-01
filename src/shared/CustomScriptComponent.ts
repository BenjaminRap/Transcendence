import { ScriptComponent } from "@babylonjs-toolkit/next";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";

export abstract class	CustomScriptComponent extends ScriptComponent
{
    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string) {
		super(transform, scene, properties, alias);
		const	instance = this as any;
		const	awake = instance["awake"];

		if (typeof awake === "function" && awake.length === 0)
		{
			instance["awake"] = () => {
				awake.call(this);
			};
		}
	}
};
