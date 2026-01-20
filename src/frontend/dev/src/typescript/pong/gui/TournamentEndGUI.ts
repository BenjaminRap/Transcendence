import type { Profile } from "@shared/Profile";
import { OpponentGUI } from "./OpponentGUI";
import type { IGUI } from "./IGUI";

export type TournamentEndGUIInputs =
{
	goToMenu : HTMLButtonElement
}

export class	TournamentEndGUI extends HTMLElement implements IGUI<TournamentEndGUIInputs>
{
	private _inputs : TournamentEndGUIInputs | undefined;
	private _text? : HTMLParagraphElement;
	private _winnerContainer? : HTMLDivElement;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="tournamentEndGUIMainDiv flex flex-col h-full w-[45%] m-auto items-center">
				<div class="tournamentEndGUIWinnerContainer"></div>
				<p class="tournamentEndGUIText font-bold leading-normal text-[7cqw] text-white text-center h-1/4"></p>
				<div class="w-2/3 h-2/5">
					${this.getButtonHTML("Go To Menu", "tournamentEndGUIGoToMenu")}
				</div>
			</div>
		`;
		this._inputs = {
			goToMenu: this.querySelector<HTMLButtonElement>("button.tournamentEndGUIGoToMenu")!
		}
		this._text = this.querySelector<HTMLParagraphElement>("p.tournamentEndGUIText")!;
		this._winnerContainer = this.querySelector<HTMLDivElement>("div.tournamentEndGUIWinnerContainer")!;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full h-2/5 mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}

	public setWinner(profile : Profile)
	{
		if (!this._text)
			return ;
		const	winnerGUI = new OpponentGUI(profile);

		this._text.textContent = "WIN";
		winnerGUI.classList.add("h-1/2")
		winnerGUI.style.setProperty("--opponent-font-size", "3cqw");
		this._winnerContainer?.replaceChildren(winnerGUI);
	}

	public setLoser(isQualifications : boolean, roundMatchCount : number)
	{
		if (!this._text || !this._winnerContainer)
			return ;
		this._winnerContainer?.replaceChildren();
		const	roundName =
			isQualifications ? "Qualifications" :
			roundMatchCount === 1 ? "The Final" :
			roundMatchCount === 2 ? "The Semi-Finals" :
			roundMatchCount === 4 ? "The Quarter-Finals" :
			`The Round of ${roundMatchCount * 2}`;
		this._text.textContent = `Tou Were Disqualified in ${roundName}`;
	}
}

customElements.define("tournament-end-gui", TournamentEndGUI);
