import type { IGUI } from "./IGUI";

export type OnlineTournamentProfileGUIInputs =
{
	ban? : HTMLButtonElement,
	kick? : HTMLButtonElement,
}

export class	OnlineTournamentProfileGUI extends HTMLElement implements IGUI<OnlineTournamentProfileGUIInputs>
{
	private static readonly _kickImage = "images/kick.png";
	private static readonly _banImage = "images/ban.png";

	private _inputs : OnlineTournamentProfileGUIInputs | undefined;

	constructor(
		private _addKickAndBanButtons = false,
		private _name = "unkown")
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("flex", "flex-row", "aspect", "border-solid", "border-(length:--border-width)", "border-(--border-color)", "justify-between");
		this.innerHTML = `
			<p class="text-(--text-color) font-(family-name:--font) text-[1cqw]" >${this._name}</p>
			${this._addKickAndBanButtons ? this.getKickAndBanButtonsHTML() : ""}
		`;
		this._inputs = {
			ban : this.querySelector<HTMLButtonElement>("button.onlineTournamentProfileBan") ?? undefined,
			kick : this.querySelector<HTMLButtonElement>("button.onlineTournamentProfileKick") ?? undefined,
		}
	}

	private	getKickAndBanButtonsHTML()
	{
		return `
		<div>
			<img class="onlineTournamentProfileKick" src="${OnlineTournamentProfileGUI._kickImage}"/>
			<img class="onlineTournamentProfileBan" src="${OnlineTournamentProfileGUI._banImage}"/>
		</div>`;
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("online-tournament-profile-gui", OnlineTournamentProfileGUI);
