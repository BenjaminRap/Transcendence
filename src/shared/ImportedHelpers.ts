import zod from "zod";
import { ImportedCustom, type Constructor } from "./ImportedDecorator";
import { FreeCamera, TransformNode } from "@babylonjs/core";
import { SceneManager } from "@babylonjs-toolkit/next";
import type { CustomScriptComponent } from "./CustomScriptComponent";
import { PongError } from "./pongError/PongError";

export const	zodNumber = zod.number();
export const	zodInt = zod.int();
export const	zodString = zod.string();
export const	zodBoolean = zod.boolean();
export const	zodTransform = zod.instanceof(TransformNode);
const			zodTransformOrNull = zod.instanceof(TransformNode).nullable();

export const ImportedCamera = ImportedCustom(zodTransform, (transform : TransformNode) => {
	const	camera : FreeCamera | null = SceneManager.FindSceneCameraRig(transform);

	if (camera === null)
		throw new PongError(`The transform ${transform.name} doesn't have a camera rig !`, "quitScene");
	return camera;

});

export function ImportedComponentOptional<T extends CustomScriptComponent>(scriptComponent : Constructor<T>)
{
	return ImportedCustom(zodTransformOrNull, (transform : TransformNode | null) => {
		if (transform === null)
			return null;
		const	componentName = scriptComponent.name;
		const	component = SceneManager.GetComponent(transform, componentName, false);

		if (component === null)
			throw new PongError(`The TransformNode ${transform} doesn't have the ${componentName} component !`, "quitScene");
		if (!(component instanceof scriptComponent))
			throw new PongError(`The SceneManager retreived a component who isn't a ${componentName} !`, "quitScene");
		return component;
	});
}
