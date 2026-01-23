import type { Profile } from "@shared/ServerMessage";
import { OpponentGUI } from "./OpponentGUI";
import { DrawGUI } from "./DrawGUI";

export class	MatchGUI extends HTMLElement
{
	private static readonly _fightMask : string = "url(/images/fight.png)";
	private _matchOrWinner : HTMLDivElement | OpponentGUI | DrawGUI;
	private _winnerSet : boolean = false;

	constructor()
	{
		super();
		this.style.setProperty("--fight-mask", MatchGUI._fightMask);
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
		this._matchOrWinner = this.querySelector("div.MatchGUICard")!;
	}

	public setWinner(profile : Profile)
	{
		if (this._winnerSet)
			return ;
		this._winnerSet = true;
		const	opponentGUI = new OpponentGUI(profile);

		opponentGUI.classList.add("w-1/2", "m-auto");

		this._matchOrWinner.replaceWith(opponentGUI);
		this._matchOrWinner = opponentGUI;
	}

	public setDraw()
	{
		if (this._winnerSet)
			return ;
		this._winnerSet = true;
		const	drawGUI = new DrawGUI();

		drawGUI.classList.add("w-1/2", "m-auto");

		this._matchOrWinner.replaceWith(drawGUI);
		this._matchOrWinner = drawGUI;
	}
}

customElements.define("match-gui", MatchGUI);
