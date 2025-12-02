import { ScriptComponent } from "@babylonjs-toolkit/next";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";

export class	CustomScriptComponent extends ScriptComponent
{
    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string) {
		super(transform, scene, properties, alias);
		const	instance = this as any;
		const	awake = instance["awake"];

		if (typeof awake === "function" && awake.length === 0)
		{
			instance["awake"] = () => {
				// if (alias === "GrassGenerator")
				// {
				// 	const notImported = Object.keys(this).filter((key : string) {
				//
				// 	});
				// 	Object.keys(this).forEach((key : string) => {
				// 		if (!key.startsWith("imported__"))
				// 			return ;
				// 		const	name = key.replace("imported__", "");
				// 		const	autoName = `auto__${name}`;
				//
				// 		if (!(autoName in properties))
				// 			throw new Error(`The ${name} property isn't imported !`);
				// 	});
				// }
				awake.call(this);
			};
		}
	}
};
