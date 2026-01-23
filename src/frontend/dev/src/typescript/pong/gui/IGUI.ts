export type IGUIInputsType = Record<string, HTMLButtonElement | undefined> | void;

export interface IGUI<T extends IGUIInputsType>
{
	getInputs() : T extends void ? undefined : T;
}


export function	initMenu<K extends HTMLElement, T extends IGUIInputsType>(menu : IGUI<T> & K, callbacks : { [K in keyof T]: () => void }, container : HTMLElement, hidden = true) : K
{
	container.appendChild(menu);
	if (hidden)
		menu.classList.add("hidden");
	const	inputs = menu.getInputs();
	
	if (typeof inputs !== "object")
		return menu;

	Object.entries(inputs).forEach(([key, value]) => {
		value?.addEventListener("click", callbacks[key as (keyof T)]);
	});

	return menu;
}
