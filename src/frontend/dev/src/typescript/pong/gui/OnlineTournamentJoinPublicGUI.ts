import type { TournamentDescription } from "@shared/ServerMessage";
import type { IGUI } from "./IGUI";

export type OnlineTournamentJoinPublicGUIInputs =
{
	refresh: HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentJoinPublicGUI extends HTMLElement implements IGUI<OnlineTournamentJoinPublicGUIInputs>
{
	private _inputs : OnlineTournamentJoinPublicGUIInputs | undefined;
	private _descriptionsContainer : HTMLDivElement | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
			<fieldset class="w-11/12 h-3/5 overflow-y-scroll pointer-events-auto border-solid border-(--border-color) border-(length:--border-width) m-auto mt-[1%] scrollbar-thumb-white scrollbar-track-[transparent] cursor-all-scroll">
				<legend class="m-auto pr-[2%] pl-[2%] text-[3cqw] text-(--text-color) font-(family-name:--font)">Participants</legend>
				<div class="OnlineTournamentJoinPublicGUITournamentsDescriptions inline"></div>
			</fieldset>
			<div class="flex flex-col size-full h-1/3 w-1/4 m-auto">
				${this.getButtonHTML("Refresh", "OnlineTournamentJoinPublicGUIRefresh")}
				${this.getButtonHTML("Cancel", "OnlineTournamentJoinPublicGUICancel")}
			</div>
		`;
		this._descriptionsContainer = this.querySelector<HTMLDivElement>("div.OnlineTournamentJoinPublicGUITournamentsDescriptions")!;
		this._inputs = {
			refresh: this.querySelector<HTMLButtonElement>("button.OnlineTournamentJoinPublicGUIRefresh")!,
			cancel: this.querySelector<HTMLButtonElement>("button.OnlineTournamentJoinPublicGUICancel")!
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

	public setTournaments(descriptions : TournamentDescription[])
	{
		descriptions.forEach((description) => {

		});
	}
}

customElements.define("online-tournament-join-public-gui", OnlineTournamentJoinPublicGUI);
