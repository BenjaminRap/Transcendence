import type { TournamentDescription, TournamentId } from "@shared/ZodMessageType";
import type { IGUI } from "./IGUI";

const	defaultDescription : TournamentDescription = {
    name: "defautServer",
    currentPlayerCount: 0,
    maxPlayerCount: 0,
	id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
};

export type TournamentDescriptionGUIInputs = {
	main: HTMLButtonElement
};

export class	TournamentDescriptionGUI extends HTMLElement implements IGUI<TournamentDescriptionGUIInputs>
{
	private	_inputs : TournamentDescriptionGUIInputs;

	constructor(private _description : TournamentDescription = defaultDescription)
	{
		super();
		this.classList.add("menu-button", "mt-[3%]", "block");
		this.innerHTML = `
				<button class="flex flex-row justify-between w-11/12 m-auto tournamentDescriptionGUIMain">
					<p>${this._description.name}</p>
					<p>${this._description.currentPlayerCount}/${this._description.maxPlayerCount}</p>
				</button>
		`;
		this._inputs = {
			main: this.querySelector("button.tournamentDescriptionGUIMain")!
		}
	}

	public getTournamentId() : TournamentId
	{
		return this._description.id;
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("tournament-description-gui", TournamentDescriptionGUI);
