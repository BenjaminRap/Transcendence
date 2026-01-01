import { Clamp } from "@babylonjs/core";
import { MatchGUI } from "./MatchGUI";
import { OpponentGUI } from "./OpponentGUI";
import type { Match } from "@shared/Match";
import type { Profile } from "@shared/Profile";

export class	TournamentGUI extends HTMLElement
{
	private static readonly _lineWidth = "1.5cqw";
	private static readonly _rounded = "3cqw";

	private _matchesByRound : Match[][];
	private _participants : Profile[];
	private _container! : HTMLDivElement;
	private	_zoomPercent : number = 1;
	private _wheelZoomAdd : number = 0.025;
	private _wheelZoomMax : number = 2;
	private _dragging : boolean = false;
	private _left : number = 0;
	private _top : number = 0;

	constructor(matchesByRound : Match[][] = [], participants : Profile[] = [])
	{
		super();
		this._matchesByRound = matchesByRound ?? [];
		this._participants = participants ?? [];
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-auto", "backdrop-blur-sm", "flex", "items-center");
		this._container = this.createContainer();
		this.placeMatches();
		this.placeParticipants();
		this.addEventListener("wheel", this.zoom.bind(this));
		this.addEventListener("mousedown", () => this._dragging = true);
		window.addEventListener("mouseup", () => this._dragging = false);
		this.addEventListener("mousemove", (mouseEvent : MouseEvent) => { if (this._dragging) this.drag(mouseEvent); });
		this._wheelZoomMax = this._matchesByRound.length;

		this.appendChild(this._container);
	}

	private	createContainer() : HTMLDivElement
	{
		const	div = document.createElement("div");

		div.classList.add("inset-0", "w-full", "flex", "flex-col", "relative");

		return div;
	}

	private	placeMatches()
	{
		for (let round = this._matchesByRound.length - 1; round >= 0; round--) {
			const	matches = this._matchesByRound[round];
			const	div = document.createElement("div");
			const	width =  `calc((50% + ${TournamentGUI._lineWidth}) / ${matches.length})`;
			div.style.setProperty("--match-line-width", `calc(${TournamentGUI._lineWidth} / ${matches.length})`);
			div.style.setProperty("--rounded", `calc(${TournamentGUI._rounded} / ${matches.length})`);
			
			div.classList.add("flex", "flex-row", "justify-around", "w-full");
			for (let index = 0; index < matches.length; index++) {
				const matchGUI = new MatchGUI();

				matchGUI.style.width = width;
				
				div.appendChild(matchGUI);
			}
			this._container.appendChild(div);
		}
	}

	private	placeParticipants()
	{
		const	div = document.createElement("div");
		const	width =  `calc((50% + ${TournamentGUI._lineWidth}) / ${this._participants.length})`;

		div.classList.add("flex", "flex-row", "justify-around");
		div.style.setProperty("--opponent-font-size", `calc(10cqw / ${this._participants.length})`);
		div.style.setProperty("--rounded", `calc(${TournamentGUI._rounded} / ${this._participants.length})`);
		div.style.setProperty("--border-width", `calc(${TournamentGUI._lineWidth} / ${this._participants.length})`);
		for (let index = 0; index < this._participants.length; index++) {
			const participant = this._participants[index];
			const matchGUI = new OpponentGUI(participant);

			matchGUI.style.width = width;
			
			div.appendChild(matchGUI);
		}
		this._container.appendChild(div);
	}
	
	private	zoom(event : WheelEvent)
	{
		event.preventDefault();
		let	newZoomPercent = this._zoomPercent;

		if (event.deltaY > 0)
		{
			const	frameBounds = this.getBoundingClientRect();
			const	elementBounds = this._container.getBoundingClientRect();

			if (elementBounds.width < frameBounds.width && elementBounds.height < frameBounds.height)
				return 
			newZoomPercent -= this._wheelZoomAdd;
		}
		else
			newZoomPercent += this._wheelZoomAdd;
		newZoomPercent = Math.min(newZoomPercent, this._wheelZoomMax);
		const	bounds = this._container.getBoundingClientRect();
		const center = {
			x: bounds.width / 2 + bounds.x,
			y: bounds.height / 2 + bounds.y
		};
		const zoomPointDiffToCenter = {
			x: center.x - event.clientX,
			y : center.y - event.clientY
		};

		this._left += zoomPointDiffToCenter.x * (newZoomPercent - this._zoomPercent) / this._zoomPercent;
		this._top += zoomPointDiffToCenter.y * (newZoomPercent - this._zoomPercent) / this._zoomPercent;
		this._zoomPercent = newZoomPercent;
		this.updateTransform();
	}

	private	drag(mouseEvent : MouseEvent)
	{
		this._left += mouseEvent.movementX;
		this._top += mouseEvent.movementY;
		this.updateTransform();
	}

	private	updateTransform()
	{
		const	bounds = this._container.getBoundingClientRect();

		this._left = Clamp(this._left, -bounds.width / 2, bounds.width / 2);
		this._top = Clamp(this._top, -bounds.height / 2, bounds.height / 2);
		this._container.style.transform = `translate(${this._left}px, ${this._top}px) scale(${this._zoomPercent})`;
	}
}

customElements.define("tournament-gui", TournamentGUI);
