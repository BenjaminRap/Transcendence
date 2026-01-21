import type { IGUI } from "./IGUI";
import type { TournamentGUI } from "./TournamentGUI";

export type TournamentEndGUIInputs =
{
	goToMenu : HTMLButtonElement
}

export class	TournamentEndGUI extends HTMLElement implements IGUI<TournamentEndGUIInputs>
{
	private _inputs : TournamentEndGUIInputs;
	private _text : HTMLParagraphElement;
	private _tournamentGUIContainer : HTMLDivElement;

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="tournamentEndGUIMainDiv flex flex-col h-full w-full m-auto items-center">
				<p class="tournamentEndGUIText font-bold leading-normal text-[7cqw] text-white text-center h-1/5"></p>
				<div class="relative h-[70%] w-[90%] border-solid border-(length:--border-width) border-(--border-color) overflow-hidden rounded-(--rounded) tournamentEndGUITournamentGUIContainer"></div>
				<div class="absolute bottom-[4%] w-1/3 h-[12%]">
					${this.getButtonHTML("Go To Menu", "tournamentEndGUIGoToMenu")}
				</div>
			</div>
		`;
		this._inputs = {
			goToMenu: this.querySelector<HTMLButtonElement>("button.tournamentEndGUIGoToMenu")!
		}
		this._text = this.querySelector<HTMLParagraphElement>("p.tournamentEndGUIText")!;
		this._tournamentGUIContainer = this.querySelector<HTMLDivElement>("div.tournamentEndGUITournamentGUIContainer")!;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full h-full menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}

	public setWinner(tournamentGui? : TournamentGUI)
	{
		if (tournamentGui)
		{
			this._tournamentGUIContainer.classList.remove("hidden");
			this._tournamentGUIContainer.replaceChildren(tournamentGui);
			tournamentGui.classList.remove("hidden");
		}
		this._text.textContent = "WIN";
	}

	public setLoser(isQualifications : boolean, roundMatchCount : number)
	{
		this._tournamentGUIContainer.classList.add("hidden");
		this._tournamentGUIContainer.replaceChildren();
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
