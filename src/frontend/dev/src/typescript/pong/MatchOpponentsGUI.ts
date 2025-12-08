import type { Profile } from "./FrontendTournament";
import { applyTheme, type ThemeName } from "./menuStyles";
import { OpponentGUI } from "./OpponentGUI";

export class	MatchOpponentsGUI extends HTMLElement
{
	constructor(private _style? : ThemeName, private _rightOpponent? : Profile, private _leftOpponent? : Profile)
	{
		super();
		applyTheme(this, this._style ?? "basic");
	}

	public connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm", "flex", "flex-row", "justify-around", "items-center");
		const	rightOpponent = new OpponentGUI(this._style, this._rightOpponent);
		rightOpponent.classList.add("w-1/5");

		const	fightImg = document.createElement("img");
		fightImg.classList.add("w-1/5");
		const	leftOpponent = new OpponentGUI(this._style, this._leftOpponent);
		leftOpponent.classList.add("w-1/5");

		fightImg.src = "/images/fight.png";

		this.append(rightOpponent, fightImg, leftOpponent);
	}
}

customElements.define("match-opponents-gui", MatchOpponentsGUI);
