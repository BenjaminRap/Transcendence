import { SceneManager } from "@babylonjs-toolkit/next";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import zod from "zod";
import { CustomScriptComponent } from "./CustomScriptComponent";
import { AbstractMesh, Color4, Material, Texture, Vector2, Vector3, Vector4 } from "@babylonjs/core";

export type Constructor<T> = abstract new (...args : any[]) => T;
export type ToolkitExported = Vector2 | Vector3 | Vector4 | Color4 | TransformNode | Material | Texture | AbstractMesh;
export type ImportedType<T extends ToolkitExported> = Constructor<T> | zod.ZodType | string;

export function	ImportedCustom<Checker extends zod.ZodType, Return>(zodChecker : Checker, cast : (value : zod.infer<Checker>) => Return)
{
	return (target : any, key : string) => {
		if (!(target instanceof CustomScriptComponent))
			throw new Error("The Imported decorator should only be used in CustomScriptComponent !");
		updateImportedMetadata(target, key);
		const	internalKey = `imported__${key}`;
		Object.defineProperty(target, key, {
			get() {
				return this[internalKey];
			},
			set(value : any) {
				try {
					const	parsedValue = parseZodType(zodChecker, value);
					const	castedValue = cast(parsedValue);

					this[internalKey] = castedValue;
				} catch (error) {
					throw new Error(`Error importing ${key}, error : ${error}`);
				}
			},
			configurable: true,
			enumerable: true
		});
	}
}

export function	Imported<T extends ToolkitExported>(importedType : ImportedType<T>, isArray : boolean = false)
{
	return (target : any, key : string) => {
		if (!(target instanceof CustomScriptComponent))
			throw new Error("The Imported decorator should only be used in CustomScriptComponent !");
		updateImportedMetadata(target, key);
		const	internalKey = `imported__${key}`;
		Object.defineProperty(target, key, {
			get() {
				return this[internalKey];
			},
			set(value : any) {
				try {
					const	parsedValue = parseValue(importedType, value, isArray);

					this[internalKey] = parsedValue;
				} catch (error) {
					throw new Error(`Error importing ${key}, error : ${error}`);
				}
			},
			configurable: true,
			enumerable: true
		});
	}
}

function	updateImportedMetadata(target : any, key : string)
{
		const	imported = Reflect.getMetadata("custom:imported", target) as string[] ?? [];

		imported.push(key);
		Reflect.defineMetadata("custom:imported", imported, target);
}

function	parseValue<T extends ToolkitExported>(importedType : ImportedType<T>, value : any, isArray : boolean)
{
	if (isArray)
		return parseArrayValue(importedType, value);
	return parseSingleValue(importedType, value);
}

function	parseArrayValue<T extends ToolkitExported>(importedType : ImportedType<T>, value : any[]) : any[] {
	return value.map((value : any) => parseSingleValue(importedType, value));
}

function	parseSingleValue<T extends ToolkitExported>(importedType : ImportedType<T>, value : any) : any {
	if (typeof importedType === "string")
		return parseCustomScriptComponent(importedType, value);
	if (typeof importedType === "function")
		return parseToolkitExported(importedType, value);
	else
		return parseZodType(importedType, value);
}

function	parseZodType(importedType : zod.ZodType, value : any) : any
{
	const	parsed = importedType.safeParse(value);

	if (!parsed.success)
		throw new Error(`The value passed to the setter doesn't correspond to the zod type, error : ${parsed.error}`)
	return parsed.data;
}

function	parseCustomScriptComponent(importedType : string, value : any) : CustomScriptComponent
{
	if (!(value instanceof TransformNode))
		throw new Error(`Imported CustomScriptComponent variable assigned with the wrong type, expecting TransformNode`);
	const	component = SceneManager.GetComponent(value, importedType, false);

	if (component === null)
		throw new Error(`The TransformNode ${value} doesn't have the ${importedType} component !`);
	return component;
}

function	parseToolkitExported<T extends ToolkitExported>(importedType : Constructor<T>, value : any)
{
	if (!(value instanceof importedType))
		throw new Error(`The value assigned isn't of the right class, expecting ${importedType.name} !`);
	return value;
}
