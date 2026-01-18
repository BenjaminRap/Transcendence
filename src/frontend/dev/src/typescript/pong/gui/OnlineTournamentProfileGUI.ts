import type { IGUI } from "./IGUI";

export type OnlineTournamentProfileGUIInputs =
{
	ban? : HTMLButtonElement,
	kick? : HTMLButtonElement,
}

export class	OnlineTournamentProfileGUI extends HTMLElement implements IGUI<OnlineTournamentProfileGUIInputs>
{
	private static readonly _kickImage = "url(/images/kick.png)";
	private static readonly _banImage = "url(/images/ban.png)";

	private _inputs : OnlineTournamentProfileGUIInputs | undefined;

	constructor(
		private _addKickAndBanButtons = false,
		private _name = "unkown")
	{
		super();
		this.style.setProperty("--kick-image", OnlineTournamentProfileGUI._kickImage);
		this.style.setProperty("--ban-image", OnlineTournamentProfileGUI._banImage);
	}

	public	connectedCallback()
	{
		this.classList.add("flex", "flex-row", "aspect", "border-solid", "border-(length:--border-width)", "border-(--border-color)", this._addKickAndBanButtons ? "justify-between" : "justify-around", "rounded-(--rounded)", "aspect-8/1", "p-[0.3cqw]");
		this.innerHTML = `
			<p class="text-(--text-color) font-(family-name:--font) text-[2cqw] leading-[0.5]" >${this._name}</p>
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
		<div class="flex flex-row">
			<div class="h-full aspect-square mask-no-repeat mask-contain mask-center bg-(--border-color) mask-(--kick-image) mr-[5%] hover:scale-110 onlineTournamentProfileKick"></div>
			<div class="h-full aspect-square mask-no-repeat mask-contain mask-center bg-(--border-color) mask-(--ban-image) hover:scale-110 onlineTournamentProfileBan"></div>
		</div>`;
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("online-tournament-profile-gui", OnlineTournamentProfileGUI);
