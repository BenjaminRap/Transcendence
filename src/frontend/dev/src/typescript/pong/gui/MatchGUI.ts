import type { Profile } from "@shared/Profile";
import { OpponentGUI } from "./OpponentGUI";
import { PongError } from "@shared/pongError/PongError";

export class	MatchGUI extends HTMLElement
{
	private static readonly _fightMask : string = "url(/images/fight.png)";
	private _matchOrOpponent? : HTMLDivElement | OpponentGUI;

	constructor()
	{
		super();
		this.style.setProperty("--fight-mask", MatchGUI._fightMask);
	}

	connectedCallback()
	{
		this.classList.add("flex", "flex-col");
		this.innerHTML = `
			<div class="block border-solid border-(--border-color) border-(length:--match-line-width) rounded-(--rounded) aspect-2/3 w-1/2 m-auto bg-(--background-color) bg-(image:--background-image) MatchGUICard">
				<div class="m-auto w-4/5 aspect-square mt-[46%] mask-(--fight-mask) mask-no-repeat mask-contain mask-center bg-(--border-color)"></div>
			</div>
			<div class="w-full aspect-6/2">
				<div class="w-(--match-line-width) bg-(--border-color) m-auto h-1/2"></div>
				<div class="w-full border-(length:--match-line-width) border-b-0 border-(--border-color) h-1/2 box-border rounded-t-(length:--match-line-width)"></div>
			</div>
		`;
		this._matchOrOpponent = this.querySelector("div.MatchGUICard")!;
	}

	public setWinner(profile : Profile)
	{
		if (this._matchOrOpponent === undefined)
			throw new PongError("MatchGUI setWinner called before the connectedCallback !", "quitPong");
		if (this._matchOrOpponent instanceof OpponentGUI)
			throw new PongError("MatchGUI setWinner has been called twice !", "quitPong");
		const	opponentGUI = new OpponentGUI(profile);

		opponentGUI.classList.add("w-1/2", "m-auto");

		this._matchOrOpponent.replaceWith(opponentGUI);
		this._matchOrOpponent = opponentGUI;
	}
}

customElements.define("match-gui", MatchGUI);
