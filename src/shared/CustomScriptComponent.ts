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
				const	imported = (Reflect.getMetadata("custom:imported", this) as string[] ?? [])
					.sort((a, b) => a.localeCompare(b));
				const	auto = Object.keys(properties)
					.filter((key) => key.startsWith("auto__"))
					.map((key) => key.slice(6, key.length))
					.sort((a, b) => a.localeCompare(b));
				if (imported.length !== auto.length)
					throw new Error(`Wrong imported injections, expected : ${imported}, got : ${auto}`);
				for (let index = 0; index < imported.length; index++) {
					if (imported[index] != auto[index])
						throw new Error(`Wrong imported injections, expected : ${imported}, got : ${auto}`);
				}
				awake.call(this);
			};
		}
	}
};
