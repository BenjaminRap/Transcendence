import type { IGUI } from "./IGUI";

export type OnlineTournamentChoiceGUIInputs =
{
}

export class	OnlineTournamentChoiceGUI extends HTMLElement implements IGUI<OnlineTournamentChoiceGUIInputs>
{
	private _buttons : OnlineTournamentChoiceGUIInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
		`;
		this._buttons = {
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} font-(family-name:--font) text-[3cqw] w-full mt-[10%] pointer-events-auto grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._buttons;
	}
}

customElements.define("online-tournament-choice-gui", OnlineTournamentChoiceGUI);
