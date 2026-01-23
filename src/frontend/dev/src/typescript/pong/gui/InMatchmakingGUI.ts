import type { IGUI } from "./IGUI";
import { getLoadingLogoHTML } from "./utilities";

export type InMatchmakingGUIInputs = {
	cancelButton : HTMLButtonElement
}

export class	InMatchmakingGUI extends HTMLElement implements IGUI<InMatchmakingGUIInputs>
{
	private	_inputs : InMatchmakingGUIInputs;

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
			<div class="flex flex-col absolute left-1/2 top-2/3 -translate-1/2 w-1/3">
				<div class="flex flex-row">
					${getLoadingLogoHTML("w-[10%] mr-[10%]")}
					<p class="font-bold text-center leading-[normal] text-[3cqw] text-(--text-color) font-(family-name:--font)">Waiting For A Match</p>
				</div>
				<button class="inMatchmakingGUICancel text-center text-[3cqw] text-(--text-color) font-(family-name:--font) mt-[20%] pointer-events-auto menu-button">Cancel</button>
			</div>
		`;
		this._inputs = {
			cancelButton: this.querySelector("button.inMatchmakingGUICancel")!
		};
	}

	public	getInputs()
	{
		return this._inputs;
	}
}

customElements.define("in-matchmaking-gui", InMatchmakingGUI);
