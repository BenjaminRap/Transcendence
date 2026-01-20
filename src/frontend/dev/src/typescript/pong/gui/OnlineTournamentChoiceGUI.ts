import type { IGUI } from "./IGUI";

export type OnlineTournamentChoiceGUIInputs =
{
	create : HTMLButtonElement,
	joinPublic : HTMLButtonElement,
	joinPrivate : HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentChoiceGUI extends HTMLElement implements IGUI<OnlineTournamentChoiceGUIInputs>
{
	private _inputs : OnlineTournamentChoiceGUIInputs;

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col h-4/6 w-1/3 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("Create Tournament", "OnlineTournamentChoiceCreate")}
				${this.getButtonHTML("Join Public Tournament", "OnlineTournamentChoiceJoinPublic")}
				${this.getButtonHTML("Join Private Tournament", "OnlineTournamentChoiceJoinPrivate")}
				${this.getButtonHTML("Cancel", "OnlineTournamentChoiceCancel")}
			</div>
		`;
		this._inputs = {
			create : this.querySelector("button.OnlineTournamentChoiceCreate")!,
			joinPublic : this.querySelector("button.OnlineTournamentChoiceJoinPublic")!,
			joinPrivate : this.querySelector("button.OnlineTournamentChoiceJoinPrivate")!,
			cancel : this.querySelector("button.OnlineTournamentChoiceCancel")!,
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("online-tournament-choice-gui", OnlineTournamentChoiceGUI);
