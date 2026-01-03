export interface IGUI<T extends Record<string, HTMLButtonElement> | void>
{
	getInputs() : T extends void ? undefined : T | undefined;
}
