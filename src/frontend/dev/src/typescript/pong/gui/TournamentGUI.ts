import { Clamp } from "@babylonjs/core";
import { MatchGUI } from "./MatchGUI";
import { OpponentGUI } from "./OpponentGUI";
import type { IGUI } from "./IGUI";
import { PongError } from "@shared/pongError/PongError";
import { isPowerOfTwo } from "@shared/utils";
import type { MatchWinningDescription, Profile } from "@shared/ServerMessage";

export class	TournamentGUI extends HTMLElement implements IGUI<void>
{
	private static readonly _lineWidth = "1.5cqw";
	private static readonly _rounded = "3cqw";
	private static readonly _opponentFontSize = "10cqw";

	private _matchesByRoundGuis : MatchGUI[][] = [];
	private _participantsGuis : OpponentGUI[] = [];
	private _container : HTMLDivElement;
	private	_zoomPercent : number = 1;
	private _wheelZoomAdd : number = 0.025;
	private _wheelZoomMax : number = 2;
	private _dragging : boolean = false;
	private _left : number = 0;
	private _top : number = 0;
	private _stopDraggingListener! : (() => void);

	constructor(private _participants : Profile[] = [])
	{
		super();
		if (this._participants.length < 2 || !isPowerOfTwo(this._participants.length))
			throw new PongError(`The profiles should be a power of two, greater than 1, got ${this._participants.length}`, "quitPong");
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-auto", "backdrop-blur-sm", "flex", "items-center", "overflow-hidden");
		this.innerHTML = `
			<div class="absolute w-1/5 left-[3cqw] top-[3cqw] border-solid border-(--border-color) border-(length:--border-width) rounded-md p-[1%]">
				<p class="text-(--text-color) text-[1.8cqw] font-(family-name:--font)">Scrool to zoom or dezoom</p>
				<p class="text-(--text-color) text-[1.8cqw] font-(family-name:--font)">Click and drag to move</p>
			</div>
			<div class="inset-0 w-full flex flex-col relative tournamentGUIContainer"></div>
		`;
		this._container = this.querySelector<HTMLDivElement>("div.tournamentGUIContainer")!;
		this.placeMatches();
		this.placeParticipants();
		this.addZoomAndGrab();
		this.appendChild(this._container);
	}

	connectedCallback()
	{
		window.addEventListener("mouseup", this._stopDraggingListener);
	}

	disconnectedCallback()
	{
		window.removeEventListener("mouseup", this._stopDraggingListener);
	}

	private	addZoomAndGrab()
	{
		this.addEventListener("wheel", this.zoom.bind(this));
		this.addEventListener("mousedown", () => {
			this.style.cursor = "grabbing";
			this._dragging = true
		});
		this._stopDraggingListener = () => {
			this.style.cursor = "grab";
			this._dragging = false;
		};
		this.addEventListener("mousemove", (mouseEvent : MouseEvent) => {
			if (this._dragging)
				this.drag(mouseEvent);
		});
		this._wheelZoomMax = Math.log2(this._participants.length);

		this.style.cursor = "grab";
	}

	private	placeMatches()
	{
		for (let matchesCount = 1; matchesCount < this._participants.length; matchesCount *= 2) {
			const	matchesGUIs = [];
			const	div = document.createElement("div");
			const	width =  `calc((50cqw + ${TournamentGUI._lineWidth}) / ${matchesCount})`;
			div.style.setProperty("--opponent-font-size", `calc(${TournamentGUI._opponentFontSize} / 2 / ${matchesCount})`);
			div.style.setProperty("--match-line-width", `calc(${TournamentGUI._lineWidth} / ${matchesCount})`);
			div.style.setProperty("--rounded", `calc(${TournamentGUI._rounded} / ${matchesCount})`);
			div.style.setProperty("--border-width", `calc(${TournamentGUI._lineWidth} / ${matchesCount})`);
			
			div.classList.add("flex", "flex-row", "justify-around", "w-full");
			for (let index = 0; index < matchesCount; index++) {
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
		const	width =  `calc((50cqw + ${TournamentGUI._lineWidth}) / ${this._participants.length})`;

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
	
	public setWinners(round : number, matches : MatchWinningDescription[])
	{
		if (round < 0 || round >= this._matchesByRoundGuis.length)
			throw new PongError("TournamentGUI setWinners called with an invalid round !", "quitPong");
		const	matchesGuis = this._matchesByRoundGuis[round];
		const	opponentsGuis = (round === 0) ? this._participantsGuis : this._matchesByRoundGuis[round - 1];
		if (matches.length !== matchesGuis.length || opponentsGuis.length !== matches.length * 2)
			throw new PongError("Invalid array length in TournamentGUI setWinners !", "quitPong");

		for (let index = 0; index < matchesGuis.length; index++) {
			const	matchGui = matchesGuis[index];
			const	match = matches[index];
			const	winner = match.winner;

			if (winner === undefined)
				throw new PongError("A match hasn't finished but TournamentGUI setWinners has been called !", "quitPong");
			matchGui.setWinner(winner?.profile);
		}
	}

	public getInputs() {
		return undefined;
	}
}

customElements.define("tournament-gui", TournamentGUI);
