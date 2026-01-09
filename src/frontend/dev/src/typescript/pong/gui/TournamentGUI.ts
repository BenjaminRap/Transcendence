import { Clamp } from "@babylonjs/core";
import { MatchGUI } from "./MatchGUI";
import { OpponentGUI } from "./OpponentGUI";
import type { Match } from "@shared/Match";
import type { Profile } from "@shared/Profile";
import type { IGUI } from "./IGUI";
import { PongError } from "@shared/pongError/PongError";

export class	TournamentGUI extends HTMLElement implements IGUI<void>
{
	private static readonly _lineWidth = "1.5cqw";
	private static readonly _rounded = "3cqw";
	private static readonly _opponentFontSize = "10cqw";

	private _matchesByRound : Match[][];
	private _participants : Profile[];
	private _matchesByRoundGuis : MatchGUI[][] = [];
	private _participantsGuis : OpponentGUI[] = [];
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
		this.addZoomAndGrab();
		this.appendChild(this._container);
	}

	private	addZoomAndGrab()
	{
		this.addEventListener("wheel", this.zoom.bind(this));
		this.addEventListener("mousedown", () => {
			this.style.cursor = "grabbing";
			this._dragging = true
		});
		window.addEventListener("mouseup", () => {
			this.style.cursor = "grab";
			this._dragging = false
		});
		this.addEventListener("mousemove", (mouseEvent : MouseEvent) => {
			if (this._dragging)
				this.drag(mouseEvent);
		});
		this._wheelZoomMax = this._matchesByRound.length;

		this.style.cursor = "grab";
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
			const	matchesGUIs = [];
			const	matches = this._matchesByRound[round];
			const	div = document.createElement("div");
			const	width =  `calc((50% + ${TournamentGUI._lineWidth}) / ${matches.length})`;
			div.style.setProperty("--opponent-font-size", `calc(${TournamentGUI._opponentFontSize} / 2 / ${matches.length})`);
			div.style.setProperty("--match-line-width", `calc(${TournamentGUI._lineWidth} / ${matches.length})`);
			div.style.setProperty("--rounded", `calc(${TournamentGUI._rounded} / ${matches.length})`);
			div.style.setProperty("--border-width", `calc(${TournamentGUI._lineWidth} / ${matches.length})`);
			
			div.classList.add("flex", "flex-row", "justify-around", "w-full");
			for (let index = 0; index < matches.length; index++) {
				const matchGUI = new MatchGUI();

				matchGUI.style.width = width;
				
				matchesGUIs.push(matchGUI);
				div.appendChild(matchGUI);
			}
			this._matchesByRoundGuis.unshift(matchesGUIs);
			this._container.appendChild(div);
		}
	}

	private	placeParticipants()
	{
		const	div = document.createElement("div");
		const	width =  `calc((50% + ${TournamentGUI._lineWidth}) / ${this._participants.length})`;

		div.classList.add("flex", "flex-row", "justify-around");
		div.style.setProperty("--opponent-font-size", `calc(${TournamentGUI._opponentFontSize} / ${this._participants.length})`);
		div.style.setProperty("--rounded", `calc(${TournamentGUI._rounded} / ${this._participants.length})`);
		div.style.setProperty("--border-width", `calc(${TournamentGUI._lineWidth} / ${this._participants.length})`);
		for (let index = 0; index < this._participants.length; index++) {
			const participant = this._participants[index];
			const opponentGUI = new OpponentGUI(participant);

			opponentGUI.style.width = width;
			
			this._participantsGuis.push(opponentGUI)
			div.appendChild(opponentGUI);
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
	
	public setWinners(round : number)
	{
		if (round < 0 || round >= this._matchesByRound.length)
			throw new PongError("TournamentGUI setWinners called with an invalid round !", "quitPong");
		const	matchesGuis = this._matchesByRoundGuis[round];
		const	matches = this._matchesByRound[round];
		const	opponentsGuis = (round === 0) ? this._participantsGuis : this._matchesByRoundGuis[round - 1];
		if (matches.length !== matchesGuis.length || opponentsGuis.length !== matches.length * 2)
			throw new PongError("Invalid array length in TournamentGUI setWinners !", "quitPong");

		for (let index = 0; index < matchesGuis.length; index++) {
			const	matchGui = matchesGuis[index];
			const	match = matches[index];
			const	left = opponentsGuis[index * 2];
			const	right = opponentsGuis[index * 2 + 1];
			const	winner = match.getWinner();
			const	winnerSide = match.getWinnerSide();

			if (winner === undefined || winnerSide === undefined)
				throw new PongError("A match hasn't finished but TournamentGUI setWinners has been called !", "quitPong");
			matchGui.setWinner(winner);
			left.setHasWon(winnerSide === "left");
			right.setHasWon(winnerSide === "right");
		}
	}

	public getInputs() {
		return undefined;
	}
}

customElements.define("tournament-gui", TournamentGUI);
