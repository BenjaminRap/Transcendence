import type { TournamentDescription } from "@shared/ServerMessage";

const	defaultDescription : TournamentDescription = {
    name: "defautServer",
    currentPlayerCount: 0,
    maxPlayerCount: 0,
	id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
};

export class	TournamentDescriptionGUI extends HTMLElement
{
	private _description : TournamentDescription;

	constructor(description? : TournamentDescription)
	{
		super();
		this._description = description ?? defaultDescription;
	}

	public	connectedCallback()
	{
		this.classList.add("menu-button", "mt-[3%]", "block");
		this.innerHTML = `
				<div class="flex flex-row justify-between w-11/12 m-auto">
					<p>${this._description.name}</p>
					<p>${this._description.currentPlayerCount}/${this._description.maxPlayerCount}</p>
				</div>
		`;
	}
}

customElements.define("tournament-description-gui", TournamentDescriptionGUI);
