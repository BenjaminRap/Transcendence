import type { IGUI } from "./IGUI";

export type OnlineTournamentCreationGUIInputs =
{
	create: HTMLButtonElement,
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
			<div class="flex flex-col size-full h-4/6 w-1/4 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("Create Tournament", "OnlineTournamentCreationGUICreate")}
				${this.getButtonHTML("Cancel", "OnlineTournamentCreationGUICancel")}
			</div>
		`;
		this._buttons = {
			create: this.querySelector("button.OnlineTournamentCreationGUICreate")!,
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
