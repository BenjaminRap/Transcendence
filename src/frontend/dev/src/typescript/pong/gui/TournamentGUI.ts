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
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-auto", "backdrop-blur-sm");
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
		if (event.deltaY > 0)
		{
			const	frameBounds = this.getBoundingClientRect();
			const	elementBounds = this._container.getBoundingClientRect();

			if (elementBounds.width < frameBounds.width && elementBounds.height < frameBounds.height)
				return 
			this._zoomPercent -= this._wheelZoomAdd;
		}
		else
			this._zoomPercent += this._wheelZoomAdd;
		this._zoomPercent = Math.min(this._zoomPercent, this._wheelZoomMax);
		this.updateTransform();
	}

	private	drag(mouseEvent : MouseEvent)
	{
		const	frameBounds = this.getBoundingClientRect();
		const	elementBounds = this._container.getBoundingClientRect();

		if ((mouseEvent.movementX > 0 && elementBounds.x < frameBounds.x)
			|| (mouseEvent.movementX < 0 && elementBounds.x + elementBounds.width > frameBounds.x + frameBounds.width))
			this._left += mouseEvent.movementX;
		if ((mouseEvent.movementY > 0 && elementBounds.y < frameBounds.y)
			|| (mouseEvent.movementY < 0 && elementBounds.y + elementBounds.height > frameBounds.y + frameBounds.height))
			this._top += mouseEvent.movementY;
		this.updateTransform();
	}

	private	updateTransform()
	{
		this._container.style.transform = `translate(${this._left}px, ${this._top}px) scale(${this._zoomPercent})`;
	}
}

customElements.define("tournament-gui", TournamentGUI);
