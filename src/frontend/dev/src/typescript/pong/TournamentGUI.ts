import type { Match, Profile } from "./FrontendTournament";
import { MatchGUI } from "./MatchGUI";
import { type ThemeName } from "./menuStyles";

export class	TournamentGUI extends HTMLElement
{
	private	_profileWidth : string = "10vw";
	private _pathHeight : string = "10vw";
	private _matchesByRound : Match[][];
	private _participants : Profile[];
	private _style? : ThemeName;

	constructor(style? : ThemeName, matchesByRound? : Match[][], participants? : Profile[])
	{
		super();
		this._style = style;
		this._matchesByRound = matchesByRound ?? [];
		this._participants = participants ?? [];
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "flex", "flex-col");
		this.style.minWidth = `calc(${this._participants.length} * 1.1 * 10vw)`;
		for (let round = this._matchesByRound.length - 1; round >= 0; round--) {
			const	matches = this._matchesByRound[round];
			const	div = document.createElement("div");
			
			div.classList.add("flex", "flex-row", "justify-around");
			for (let index = 0; index < matches.length; index++) {
				const match = matches[index];
				const matchGUI = new MatchGUI(this._style);
				matchGUI.classList.add("w-[10vw]");
				matchGUI.style.width = `calc(50% / ${matches.length} + 1vw)`;
				
				div.appendChild(matchGUI);
			}
			this.appendChild(div);
		}
	}
}

customElements.define("tournament-gui", TournamentGUI);
