import type { IGUI } from "./IGUI";

export type EndGUIInputs =
{
	restart : HTMLButtonElement,
	goToMenu : HTMLButtonElement
}

export class	EndGUI extends HTMLElement implements IGUI<EndGUIInputs>
{
	private _inputs : EndGUIInputs | undefined;
	private _mainDiv : HTMLDivElement | undefined;
	private _winText : HTMLParagraphElement | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="pauseGUIMainDiv flex flex-col size-full  h-4/6 w-1/3 -translate-y-1/2 top-1/2 absolute">
				<p class="pauseGUIWinText font-bold leading-normal text-[7cqw] text-white text-center">WIN</p>
				${this.getButtonHTML("Restart", "pauseGUIRestart")}
				${this.getButtonHTML("Go To Menu", "pauseGUIGoToMenu")}
			</div>
		`;
		this._inputs = {
			restart: this.querySelector<HTMLButtonElement>("button.pauseGUIRestart")!,
			goToMenu: this.querySelector<HTMLButtonElement>("button.pauseGUIGoToMenu")!
		}
		this._mainDiv = this.querySelector<HTMLDivElement>("div.pauseGUIMainDiv")!;
		this._winText = this.querySelector<HTMLParagraphElement>("p.pauseGUIWinText")!;
	}

	public setWinner(winner : "left" | "right" | "draw", winText : string)
	{
		if (!this._mainDiv || !this._winText)
			return ;
		if (winner === "left")
		{
			this._mainDiv.classList.remove("left-1/2", "-translate-x-1/2", "right-1/12");
			this._mainDiv.classList.add("left-1/12");
		}
		else if (winner === "right")
		{
			this._mainDiv.classList.remove("left-1/2", "-translate-x-1/2", "left-1/12");
			this._mainDiv.classList.add("right-1/12");
		}
		else
		{
			this._mainDiv.classList.remove("right-1/12", "left-1/12");
			this._mainDiv.classList.add("left-1/2", "-translate-x-1/2");
		}
		this._winText.innerText = winText;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs() : EndGUIInputs | undefined
	{
		return this._inputs;
	}
}

customElements.define("end-gui", EndGUI);
