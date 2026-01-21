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

	private _inputs : OnlineTournamentProfileGUIInputs;

	constructor(
		private _addKickAndBanButtons = false,
		private _name = "unkown")
	{
		super();
		this.style.setProperty("--kick-image", OnlineTournamentProfileGUI._kickImage);
		this.style.setProperty("--ban-image", OnlineTournamentProfileGUI._banImage);
		this.classList.add("inline-flex", "flex-row", "aspect", "border-solid", "border-(length:--border-width)", "border-(--border-color)", this._addKickAndBanButtons ? "justify-between" : "justify-around", "rounded-(--rounded)", "aspect-32/5", "pt-[0.5cqw]", "pb-[0.5cqw]", "pl-[2cqw]", "pr-[1cqw]");
		this.innerHTML = `
			<p class="text-(--text-color) font-(family-name:--font) text-[2.5cqw] leading-[0.6]" >${this._name}</p>
			${this._addKickAndBanButtons ? this.getKickAndBanButtonsHTML() : ""}
		`;
		this._inputs = {
			ban : this.querySelector<HTMLButtonElement>("div.onlineTournamentProfileBan") ?? undefined,
			kick : this.querySelector<HTMLButtonElement>("div.onlineTournamentProfileKick") ?? undefined,
		}
	}

	private	getKickAndBanButtonsHTML()
	{
		return `
		<div class="flex flex-row">
			<div class="h-full aspect-square mask-no-repeat mask-contain mask-center bg-(--border-color) mask-(--kick-image) mr-[5%] hover:scale-125 onlineTournamentProfileKick"></div>
			<div class="h-full aspect-square mask-no-repeat mask-contain mask-center bg-(--border-color) mask-(--ban-image) hover:scale-125 onlineTournamentProfileBan"></div>
		</div>`;
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("online-tournament-profile-gui", OnlineTournamentProfileGUI);
