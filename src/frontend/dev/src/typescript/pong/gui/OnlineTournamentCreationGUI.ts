import { Tournament } from "@shared/Tournament";
import type { IGUI } from "./IGUI";

export type OnlineTournamentCreationGUIInputs =
{
	start: HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentCreationGUI extends HTMLElement implements IGUI<OnlineTournamentCreationGUIInputs>
{
	private _buttons : OnlineTournamentCreationGUIInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="h-1/5 w-full">
				<p class="h-1/2 text-(--text-color) text-[4cqw] text-center border-solid border-(length:--border-width) border-(--border-color) m-auto w-fit relative top-1/2 -translate-y-1/2 pr-[5%] pl-[5%] select-text pointer-events-auto leading-[1.1]">xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
			</div>
			<div class="w-full h-1/2 overflow-y-scroll pointer-events-auto border-solid border-(--border-color) border-b-(length:--border-width) border-t-(length:--border-width)">
				<div class="inline"></div>
			</div>
			<div class="w-1/3 h-1/3 relative b-1/3 m-auto">
				${this.getButtonHTML("Start Tournament", "OnlineTournamentCreationGUIStart")}
				${this.getButtonHTML("Cancel Tournament", "OnlineTournamentCreationGUICancel")}
			</div>
		`;
		this._buttons = {
			start: this.querySelector("button.OnlineTournamentCreationGUIStart")!,
			cancel: this.querySelector("button.OnlineTournamentCreationGUICancel")!
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full h-[35%] mt-[5%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._buttons;
	}
}

customElements.define("online-tournament-creation-gui", OnlineTournamentCreationGUI);
