import type { IGUI } from "./IGUI";

export type CloseGUIInputs =
{
	close : HTMLButtonElement
}

export class	CloseGUI extends HTMLElement implements IGUI<CloseGUIInputs>
{
	private _inputs : CloseGUIInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "z-20");
		this.innerHTML = `
			<button class="aspect-square w-[4%] closeGUIClose bg-(--background-color) bg-(image:--background-color) border-(--border-color) border-(length:--border-width) rounded-[20%] absolute right-[2cqw] top-[2cqw] pointer-events-auto hover:scale-(--hover-scale)">
				<div class="aspect-square m-auto flex flex-col h-3/5 rotate-45">
					<div class="w-[13.8%] h-[45%] bg-(--border-color) m-auto"></div>
					<div class="w-full h-[13.8%] bg-(--border-color)"></div>
					<div class="w-[13.8%] h-[45%] bg-(--border-color) m-auto"></div>
				</div>
			</button>
		`;
		this._inputs = {
			close: this.querySelector<HTMLButtonElement>("button.closeGUIClose")!
		}
	}

	public getInputs() : CloseGUIInputs | undefined
	{
		return this._inputs;
	}
}

customElements.define("close-gui", CloseGUI);
