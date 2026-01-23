import type { IGUI } from "./IGUI";

export type OnlineTournamentJoinPrivateGUIInputs =
{
	join: HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentJoinPrivateGUI extends HTMLElement implements IGUI<OnlineTournamentJoinPrivateGUIInputs>
{
	private _inputs : OnlineTournamentJoinPrivateGUIInputs;
	private _tournamentIdInput : HTMLInputElement;

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="h-3/5 w-full">
				<div class="w-2/3 text-(family-name:--font) m-auto relative top-1/2 -translate-y-1/2">
					<input text="text" placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" class="w-full text-(--text-color) text-[3cqw] text-center pointer-events-auto border-(length:--border-width) border-(--border-color) rounded-(--rounded) p-[3%] focus:outline-none onlineTournamentJoinPrivateGUITournamentIdInput">
				</div>
			</div>
			<div class="flex flex-col size-full h-1/3 w-1/4 m-auto">
				${this.getButtonHTML("Join", "onlineTournamentJoinPrivateGUIRefresh")}
				${this.getButtonHTML("Cancel", "onlineTournamentJoinPrivateGUICancel")}
			</div>
		`;
		this._inputs = {
			join: this.querySelector<HTMLButtonElement>("button.onlineTournamentJoinPrivateGUIRefresh")!,
			cancel: this.querySelector<HTMLButtonElement>("button.onlineTournamentJoinPrivateGUICancel")!
		};
		this._tournamentIdInput = this.querySelector<HTMLInputElement>("input.onlineTournamentJoinPrivateGUITournamentIdInput")!;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}

	public getTournamentId()
	{
		return this._tournamentIdInput.value.trim();
	}

	public reset()
	{
		this._tournamentIdInput.value = "";
	}
}

customElements.define("online-tournament-join-private-gui", OnlineTournamentJoinPrivateGUI);
