export type IGUIInputsType = Record<string, HTMLButtonElement | undefined> | void;

export interface IGUI<T extends IGUIInputsType>
{
	getInputs() : T extends void ? undefined : T | undefined;
}
