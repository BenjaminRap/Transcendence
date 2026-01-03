import type { Profile } from "@shared/Profile";
import { OpponentGUI } from "./OpponentGUI";
import type { IGUI } from "./IGUI";

export type TournamentWinnerGUIInputs =
{
	goToMenu : HTMLButtonElement,
	quit : HTMLButtonElement
}

export class	TournamentWinnerGUI extends HTMLElement implements IGUI<TournamentWinnerGUIInputs>
{
	private _inputs : TournamentWinnerGUIInputs | undefined;
	private _winText? : HTMLParagraphElement;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="tournamentWinnerGUIMainDiv flex flex-col h-full w-[45%] m-auto items-center">
				<p class="tournamentWinnerGUIWinText font-bold leading-normal text-[7cqw] text-white text-center">WIN</p>
				<div class="flex flex-row justify-around w-full gap-[10%]">
					${this.getButtonHTML("Go To Menu", "tournamentWinnerGUIGoToMenu")}
					${this.getButtonHTML("Quit", "tournamentWinnerGUIQuit")}
				</div>
			</div>
		`;
		this._inputs = {
			goToMenu: this.querySelector<HTMLButtonElement>("button.tournamentWinnerGUIGoToMenu")!,
			quit: this.querySelector<HTMLButtonElement>("button.tournamentWinnerGUIQuit")!
		}
		this._winText = this.querySelector<HTMLDivElement>("p.tournamentWinnerGUIWinText")!;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}

	public setWinner(profile : Profile)
	{
		if (this._winText === undefined)
			throw new Error("TournamentWinnerGUI setWinner called before being added to the document !");
		const	winnerGUI = new OpponentGUI(profile);

		winnerGUI.classList.add("w-1/2")
		this._winText.insertAdjacentElement("afterend", winnerGUI);
	}
}

customElements.define("tournament-winner-gui", TournamentWinnerGUI);
