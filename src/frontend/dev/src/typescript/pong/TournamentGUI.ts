import { Clamp } from "@babylonjs/core";
import type { Match, Profile } from "./FrontendTournament";
import { MatchGUI } from "./MatchGUI";
import { type ThemeName } from "./menuStyles";
import { OpponentGUI } from "./OpponentGUI";
import { Range } from "@shared/Range";

export class	TournamentGUI extends HTMLElement
{
	private	_profileWidth : string = "10vw";
	private _pathHeight : string = "10vw";
	private _matchesByRound : Match[][];
	private _participants : Profile[];
	private _style? : ThemeName;
	private _container! : HTMLDivElement;
	private	_zoomPercent : number = 1;
	private _wheelZoomAdd : number = 0.01;
	private _wheelZoomRange = new Range(1, 2);

	constructor(style? : ThemeName, matchesByRound? : Match[][], participants? : Profile[])
	{
		super();
		this._style = style;
		this._matchesByRound = matchesByRound ?? [];
		this._participants = participants ?? [];
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none");
		this._container = this.createContainer();
		this.placeMatches();
		this.placeParticipants();
		this.addEventListener("wheel", this.zoom.bind(this));

		this.appendChild(this._container);
	}

	private	createContainer() : HTMLDivElement
	{
		const	div = document.createElement("div");

		div.classList.add("absolute", "inset-0", "size-full", "z-10", "flex", "flex-col")
		div.style.minWidth = `calc(${this._participants.length} * 1.1 * 10vw)`;

		return div;
	}

	private	placeMatches()
	{
		for (let round = this._matchesByRound.length - 1; round >= 0; round--) {
			const	matches = this._matchesByRound[round];
			const	div = document.createElement("div");
			
			div.classList.add("flex", "flex-row", "justify-around");
			for (let index = 0; index < matches.length; index++) {
				const matchGUI = new MatchGUI(this._style);

				matchGUI.classList.add("w-[10vw]");
				matchGUI.style.width = `calc(50% / ${matches.length} + 1vw)`;
				
				div.appendChild(matchGUI);
			}
			this._container.appendChild(div);
		}
	}

	private	placeParticipants()
	{
		const	div = document.createElement("div");

		div.classList.add("flex", "flex-row", "justify-around");
		for (let index = 0; index < this._participants.length; index++) {
			const participant = this._participants[index];
			const matchGUI = new OpponentGUI(this._style, participant.name);

			matchGUI.classList.add("w-[10vw]");
			matchGUI.style.width = `calc(50% / ${this._participants.length} + 1vw)`;
			
			div.appendChild(matchGUI);
		}
		this._container.appendChild(div);
	}
	
	private	zoom(event : WheelEvent)
	{
		event.preventDefault();
		if (event.deltaY > 0)
			this._zoomPercent -= this._wheelZoomAdd;
		else
			this._zoomPercent += this._wheelZoomAdd;
		this._zoomPercent = Clamp(this._zoomPercent, this._wheelZoomRange.min, this._wheelZoomRange.max);
		this._container.style.transform = `scale(${this._zoomPercent})`;
	}
}

customElements.define("tournament-gui", TournamentGUI);
