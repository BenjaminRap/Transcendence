import type { Profile } from "@shared/Profile";
import { OpponentGUI } from "./OpponentGUI";
import type { IGUI } from "./IGUI";
import type { ClientInput } from "../FrontendSceneData";
import { MatchInputGUI } from "./MatchInputGUI";

export class	MatchOpponentsGUI extends HTMLElement implements IGUI<void>
{
	private static readonly _fightMask = "url(/images/fight.png)";
	private _fightElement : HTMLDivElement;
	private _leftInput? : ClientInput;
	private _rightInput? : ClientInput;

	constructor()
	{
		super();
		this.style.setProperty("--fight-mask", MatchOpponentsGUI._fightMask);
		this.style.setProperty("--opponent-font-size", "3cqw");
		this.style.setProperty("--rounded", "1cqw");
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");

		this._fightElement = document.createElement("div");
		this._fightElement.classList.add("w-1/5", "aspect-square", "mask-(--fight-mask)", "mask-no-repeat", "mask-contain", "mask-center", "bg-(--border-color)");
	}

	public setOpponents(leftOpponent : Profile, rightOpponent : Profile)
	{
		this.replaceChildren();
		const	mainDiv = document.createElement("div");
		mainDiv.classList.add("flex", "flex-row", "justify-between", "items-center", "h-full", "w-4/5", "absolute", "left-1/2", "-translate-x-1/2");

		if (this._leftInput)
		{
			const	leftInput = new MatchInputGUI(this._leftInput.upKey, this._leftInput.downKey);
			leftInput.classList.add("left-[3%]", "w-[5%]", "top-1/2", "-translate-y-1/2", "absolute");

			this.appendChild(leftInput);
		}

		const	leftOpponentGUI = new OpponentGUI(leftOpponent);
		leftOpponentGUI.classList.add("w-1/5");

		const	rightOpponentGUI = new OpponentGUI(rightOpponent);
		rightOpponentGUI.classList.add("w-1/5");

		mainDiv.replaceChildren(leftOpponentGUI, this._fightElement, rightOpponentGUI);
		this.appendChild(mainDiv);

		if (this._rightInput)
		{
			const	rightInput = new MatchInputGUI(this._rightInput?.upKey, this._rightInput?.downKey);
			rightInput.classList.add("right-[3%]", "w-[5%]", "top-1/2", "-translate-y-1/2","absolute");

			this.appendChild(rightInput);
		}
	}

	public setInputs(clientInputs : ClientInput[])
	{
		this._leftInput = clientInputs.find(value => value.index === 0)
		this._rightInput = clientInputs.find(value => value.index === 1)
	}

	public getInputs() {
		return undefined;
	}
}

customElements.define("match-opponents-gui", MatchOpponentsGUI);
