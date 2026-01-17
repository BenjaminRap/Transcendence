import type { TournamentId } from "@shared/ServerMessage";
import type { IGUI } from "./IGUI";

export type OnlineTournamentStartGUIInputs =
{
	start: HTMLButtonElement,
	join: HTMLButtonElement,
	leave: HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentStartGUI extends HTMLElement implements IGUI<OnlineTournamentStartGUIInputs>
{
	private _inputs : OnlineTournamentStartGUIInputs | undefined;
	private _tournamentId : HTMLParagraphElement | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="h-1/5 w-full">
				<p class="h-1/2 text-(--text-color) text-[4cqw] font-(family-name:--font) text-center border-solid border-(length:--border-width) border-(--border-color) m-auto w-fit relative top-1/2 -translate-y-1/2 pr-[5%] pl-[5%] select-text pointer-events-auto leading-[1.1] onlineTournamentStartGUITournamentId">xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
			</div>
			<fieldset class="w-11/12 h-1/2 overflow-y-scroll pointer-events-auto border-solid border-(--border-color) border-(length:--border-width) m-auto scrollbar-thumb-white scrollbar-track-[transparent] cursor-all-scroll">
				<legend class="m-auto pr-[2%] pl-[2%] text-[3cqw] text-(--text-color) font-(family-name:--font)">Participants</legend>
				<div class="inline"></div>
			</fieldset>
			<div class="w-1/3 h-1/3 relative b-1/3 m-auto">
				${this.getButtonHTML("Start", "onlineTournamentStartGUIStart")}
				${this.getButtonHTML("Join", "onlineTournamentStartGUIJoin")}
				${this.getButtonHTML("Leave", "onlineTournamentStartGUILeave")}
				${this.getButtonHTML("Cancel", "onlineTournamentStartGUICancel")}
			</div>
		`;
		this._inputs = {
			start: this.querySelector("button.onlineTournamentStartGUIStart")!,
			join: this.querySelector("button.onlineTournamentStartGUIJoin")!,
			leave: this.querySelector("button.onlineTournamentStartGUILeave")!,
			cancel: this.querySelector("button.onlineTournamentStartGUICancel")!
		};
		this._tournamentId = this.querySelector<HTMLParagraphElement>("p.onlineTournamentStartGUITournamentId")!;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full h-[35%] mt-[5%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}

	public init(type : "creator" | "creator-player" | "player", tournamentId : TournamentId)
	{
		if (!this._tournamentId)
			return ;
		if (type === "creator")
			this.setOnlyInputsVisible("start", "join", "cancel");
		else if (type === "creator-player")
			this.setOnlyInputsVisible("start", "leave", "cancel");
		else
			this.setOnlyInputsVisible("leave");
		this._tournamentId.textContent = tournamentId;
	}

	private	setOnlyInputsVisible(...visibles : (keyof OnlineTournamentStartGUIInputs)[])
	{
		if (!this._inputs)
			return ;
		Object.entries(this._inputs).forEach(([key, value]) => {
			const	isVisible = visibles.includes(key as keyof OnlineTournamentStartGUIInputs);

			value.classList.toggle("invinsible", !isVisible);
		});
	}
}

customElements.define("online-tournament-start-gui", OnlineTournamentStartGUI);
