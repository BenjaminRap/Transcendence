import type { IGUI } from "./IGUI";

export type OnlineTournamentJoinPrivateGUIInputs =
{
}

export class	OnlineTournamentJoinPrivateGUI extends HTMLElement implements IGUI<OnlineTournamentJoinPrivateGUIInputs>
{
	private _inputs : OnlineTournamentJoinPrivateGUIInputs | undefined;

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

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("online-tournament-join-private-gui", OnlineTournamentJoinPrivateGUI);
