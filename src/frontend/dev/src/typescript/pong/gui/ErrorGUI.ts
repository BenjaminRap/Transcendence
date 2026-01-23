import type { IGUI } from "./IGUI";

export type ErrorGUIInputs =
{
	close : HTMLButtonElement
}

export class	ErrorGUI extends HTMLElement implements IGUI<ErrorGUIInputs>
{
	private _inputs : ErrorGUIInputs;
	private _errorText : HTMLParagraphElement;

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "backdrop-blur-sm", "z-10");
		this.innerHTML = `
				<fieldset class="w-11/12 h-2/3 border-solid border-(--border-color) border-(length:--border-width) mt-[1%] m-auto">

					<legend class="m-auto pr-[2%] pl-[2%] text-(--text-color) text-[5cqw] font-(family-name:--font)">Error</legend>
					<p class="text-[3cqw] font-(family-name:--font) text-(--text-color) text-center w-4/5 h-3/5 m-auto errorGUIText">Sorry there was an error !</p>
					<div class="h-1/3 w-1/3 m-auto">
						${this.getButtonHTML("Close", "errorGUIClose")}
					</div>
				</fieldset>
		`;
		this._inputs = {
			close: this.querySelector<HTMLButtonElement>("button.errorGUIClose")!
		};
		this._errorText = this.querySelector<HTMLParagraphElement>("p.errorGUIText")!;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button m-auto">${text}</button>`;
	}

	public getInputs() : ErrorGUIInputs
	{
		return this._inputs;
	}

	public setErrorText(errorText : string)
	{
		this._errorText.textContent = errorText;
	}
}

customElements.define("error-gui", ErrorGUI);
