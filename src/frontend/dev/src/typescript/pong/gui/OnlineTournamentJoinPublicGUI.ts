import type { TournamentDescription } from "@shared/ZodMessageType";
import { initMenu, type IGUI } from "./IGUI";
import { TournamentDescriptionGUI } from "./TournamentDescriptionGUI";
import { Observable } from "@babylonjs/core";

export type OnlineTournamentJoinPublicGUIInputs =
{
	refresh: HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentJoinPublicGUI extends HTMLElement implements IGUI<OnlineTournamentJoinPublicGUIInputs>
{
	private _inputs : OnlineTournamentJoinPublicGUIInputs;
	private _descriptionsContainer : HTMLDivElement;
	private _onTournamentJoinObservable = new Observable<string>();

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<fieldset class="w-11/12 h-3/5 overflow-y-scroll pointer-events-auto border-solid border-(--border-color) border-(length:--border-width) m-auto mt-[1%] scrollbar-thumb-white scrollbar-track-[transparent] cursor-all-scroll">
				<legend class="m-auto pr-[2%] pl-[2%] text-[3cqw] text-(--text-color) font-(family-name:--font)">Tournaments</legend>
				<div class="OnlineTournamentJoinPublicGUITournamentsDescriptions text-[length:2cqw] w-1/3 m-auto"></div>
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
		this._descriptionsContainer.replaceChildren();
		descriptions.forEach((description) => {
			const	tournamentDescriptionGUI = new TournamentDescriptionGUI(description);

			initMenu(tournamentDescriptionGUI, {
				main: () => this._onTournamentJoinObservable.notifyObservers(tournamentDescriptionGUI.getTournamentId())
			}, this._descriptionsContainer, false);
		});
	}

	public onTournamentJoin()
	{
		return this._onTournamentJoinObservable;
	}

	public reset()
	{
		this._descriptionsContainer.replaceChildren();
	}
}

customElements.define("online-tournament-join-public-gui", OnlineTournamentJoinPublicGUI);
