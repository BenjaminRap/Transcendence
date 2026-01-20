import { SceneManager } from "@babylonjs-toolkit/next";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import zod from "zod";
import { CustomScriptComponent } from "./CustomScriptComponent.js";
import { AbstractMesh, Color4, Material, Texture, Vector2, Vector3, Vector4 } from "@babylonjs/core";
import { PongError } from "./pongError/PongError.js";
export function ImportedCustom(zodChecker, cast) {
    return (target, key) => {
        if (!(target instanceof CustomScriptComponent))
            throw new PongError("The Imported decorator should only be used in CustomScriptComponent !", "quitScene");
        updateImportedMetadata(target, key);
        const internalKey = `imported__${key}`;
        Object.defineProperty(target, key, {
            get() {
                return this[internalKey];
            },
            set(value) {
                try {
                    const parsedValue = parseZodType(zodChecker, value);
                    const castedValue = cast(parsedValue);
                    this[internalKey] = castedValue;
                }
                catch (error) {
                    if (error instanceof PongError)
                        throw new PongError(`Error importing ${key}, error : ${error}`, error.getSeverity());
                    throw error;
                }
            },
            configurable: true,
            enumerable: true
        });
    };
}
export function Imported(importedType, isArray = false) {
    return (target, key) => {
        if (!(target instanceof CustomScriptComponent))
            throw new PongError("The Imported decorator should only be used in CustomScriptComponent !", "quitScene");
        updateImportedMetadata(target, key);
        const internalKey = `imported__${key}`;
        Object.defineProperty(target, key, {
            get() {
                return this[internalKey];
            },
            set(value) {
                try {
                    const parsedValue = parseValue(importedType, value, isArray);
                    this[internalKey] = parsedValue;
                }
                catch (error) {
                    if (error instanceof PongError)
                        throw new PongError(`Error importing ${key}, error : ${error}`, error.getSeverity());
                }
            },
            configurable: true,
            enumerable: true
        });
    };
}
function updateImportedMetadata(target, key) {
    const imported = Reflect.getMetadata("custom:imported", target) ?? [];
    imported.push(key);
    Reflect.defineMetadata("custom:imported", imported, target);
}
function parseValue(importedType, value, isArray) {
    if (isArray)
        return parseArrayValue(importedType, value);
    return parseSingleValue(importedType, value);
}
function parseArrayValue(importedType, value) {
    return value.map((value) => parseSingleValue(importedType, value));
}
function parseSingleValue(importedType, value) {
    if (typeof importedType === "string")
        return parseCustomScriptComponent(importedType, value);
    if (typeof importedType === "function")
        return parseToolkitExported(importedType, value);
    else
        return parseZodType(importedType, value);
}
function parseZodType(importedType, value) {
    const parsed = importedType.safeParse(value);
    if (!parsed.success)
        throw new PongError(`The value passed to the setter doesn't correspond to the zod type, error : ${parsed.error}`, "quitScene");
    return parsed.data;
}
function parseCustomScriptComponent(importedType, value) {
    if (!(value instanceof TransformNode))
        throw new PongError(`Imported CustomScriptComponent variable assigned with the wrong type, expecting TransformNode`, "quitScene");
    const component = SceneManager.GetComponent(value, importedType, false);
    if (component === null)
        throw new PongError(`The TransformNode ${value} doesn't have the ${importedType} component !`, "quitScene");
    if (!(component instanceof CustomScriptComponent))
        throw new PongError(`The component ${component.getClassName()} doesn't derive from CustomScriptComponent !`, "quitScene");
    return component;
}
function parseToolkitExported(importedType, value) {
    if (!(value instanceof importedType))
        throw new PongError(`The value assigned isn't of the right class, expecting ${importedType.name} !`, "quitScene");
    return value;
}
