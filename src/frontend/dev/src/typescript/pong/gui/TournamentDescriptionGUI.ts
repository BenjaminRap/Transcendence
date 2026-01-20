import type { TournamentDescription, TournamentId } from "@shared/ServerMessage";

const	defaultDescription : TournamentDescription = {
    name: "defautServer",
    currentPlayerCount: 0,
    maxPlayerCount: 0,
	id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
};

export class	TournamentDescriptionGUI extends HTMLElement
{
	constructor(private _description : TournamentDescription = defaultDescription)
	{
		super();
		this.classList.add("menu-button", "mt-[3%]", "block");
		this.innerHTML = `
				<div class="flex flex-row justify-between w-11/12 m-auto">
					<p>${this._description.name}</p>
					<p>${this._description.currentPlayerCount}/${this._description.maxPlayerCount}</p>
				</div>
		`;
	}

	public getTournamentId() : TournamentId
	{
		return this._description.id;
	}
}

customElements.define("tournament-description-gui", TournamentDescriptionGUI);
