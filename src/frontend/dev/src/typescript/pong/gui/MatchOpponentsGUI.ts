import type { Profile } from "@shared/Profile";
import { OpponentGUI } from "./OpponentGUI";

export class	MatchOpponentsGUI extends HTMLElement
{
	private static readonly _fightMask = "url(/images/fight.png)";
	private _fightElement! : HTMLDivElement;

	constructor()
	{
		super();
		this.style.setProperty("--fight-mask", MatchOpponentsGUI._fightMask);
	}

	public connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm", "flex", "flex-row", "justify-around", "items-center");

		this._fightElement = document.createElement("div");
		this._fightElement.classList.add("w-1/5", "aspect-square", "mask-(--fight-mask)", "mask-no-repeat", "mask-contain", "mask-center", "bg-(--border-color)");
	}

	public setOpponents(leftOpponent : Profile, rightOpponent : Profile)
	{
		const	leftOpponentGUI = new OpponentGUI(leftOpponent);
		leftOpponentGUI.classList.add("w-1/5");
		const	rightOpponentGUI = new OpponentGUI(rightOpponent);
		rightOpponentGUI.classList.add("w-1/5");


		this.replaceChildren(leftOpponentGUI, this._fightElement, rightOpponentGUI);
	}
}

customElements.define("match-opponents-gui", MatchOpponentsGUI);
