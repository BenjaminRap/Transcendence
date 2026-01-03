import type { IGUI } from "./IGUI";

export type ErrorGUIInputs =
{
}

export class	ErrorGUI extends HTMLElement implements IGUI<ErrorGUIInputs>
{
	private _inputs : ErrorGUIInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
		`;
		this._inputs = {
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs() : ErrorGUIInputs | undefined
	{
		return this._inputs;
	}
}

customElements.define("error-gui", ErrorGUI);
