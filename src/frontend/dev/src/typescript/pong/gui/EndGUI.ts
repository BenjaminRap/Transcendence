import type { EndCause } from "@shared/attachedScripts/GameManager";
import type { IGUI } from "./IGUI";
import { getLoadingLogoHTML } from "./utilities";

export type EndGUIInputs =
{
	restart? : HTMLButtonElement,
	continue? : HTMLButtonElement,
	goToMenu : HTMLButtonElement
}

export class	EndGUI extends HTMLElement implements IGUI<EndGUIInputs>
{
	private _inputs : EndGUIInputs;
	private _mainDiv : HTMLDivElement;
	private _winText : HTMLParagraphElement;

	constructor(
		private _isOnline : boolean = false,
		private _isTournament : boolean = false)
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="pauseGUIMainDiv flex flex-col size-full  h-4/6 w-1/3 -translate-y-1/2 top-1/2 absolute">
				<p class="pauseGUIWinText font-bold leading-normal text-[7cqw] text-white text-center"></p>
				<div class="absolute bottom-0">
					${this.getTypeSpecificHTML()}
					${this.getButtonHTML("Go To Menu", "pauseGUIGoToMenu")}
				</div>
			</div>
		`;
		this._inputs = {
			restart: this.querySelector<HTMLButtonElement>("button.pauseGUIRestart") ?? undefined,
			continue: this.querySelector<HTMLButtonElement>("button.pauseGUIContinue") ?? undefined,
			goToMenu: this.querySelector<HTMLButtonElement>("button.pauseGUIGoToMenu")!
		}
		this._mainDiv = this.querySelector<HTMLDivElement>("div.pauseGUIMainDiv")!;
		this._winText = this.querySelector<HTMLParagraphElement>("p.pauseGUIWinText")!;
		this.setWinTextSide("middle");
	}

	public setWinner(winner : "left" | "right" | "draw", endCause : EndCause, playerIndex? : number)
	{
		let		winText = "";
		const	winnerIndex = (winner === "left") ? 0 : 1;

		if (winner === "draw")
			winText += "Draw";
		else if (this._isOnline && winnerIndex !== playerIndex)
			winText += "Lose";
		else
			winText += "Win";
		if (endCause === "forfeit")
			winText += " By Forfeit";
		else if (endCause === "timeLimitReached")
			winText += " By Time Limit";
		this._winText.textContent = winText;
		if (this._isOnline || winner === "draw")
			this.setWinTextSide("middle");
		else
			this.setWinTextSide(winner);
	}

	private	setWinTextSide(side : "left" | "right" | "middle")
	{
		this._mainDiv.classList.remove("left-1/2", "left-1/12", "-translate-x-1/2", "right-1/12");
		if (side === "left")
			this._mainDiv.classList.add("left-1/12")
		else if (side === "right")
			this._mainDiv.classList.add("right-1/12")
		else
			this._mainDiv.classList.add("left-1/2", "-translate-x-1/2")
	}

	private	getTypeSpecificHTML()
	{
		if (!this._isTournament)
			return `${this.getButtonHTML("Restart", "pauseGUIRestart")}`;
		else if (!this._isOnline)
			return `${this.getButtonHTML("Continue", "pauseGUIContinue")}`;
		return `
			<div class="flex flex-row">
				${getLoadingLogoHTML("w-[10%] mr-[10%]")}
				<p class="font-bold text-center leading-[normal] text-[3cqw] text-(--text-color) font-(family-name:--font)">Waiting For Next Match</p>
			</div>
		`;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button max-h-[12%]">${text}</button>`;
	}

	public getInputs() : EndGUIInputs
	{
		return this._inputs;
	}
}

customElements.define("end-gui", EndGUI);
