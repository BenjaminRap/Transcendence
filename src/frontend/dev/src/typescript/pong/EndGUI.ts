export type EndGUIButtons =
{
	restart : HTMLButtonElement,
	goToMenu : HTMLButtonElement,
	quit : HTMLButtonElement
}

export class	EndGUI extends HTMLElement
{
	private _buttons : EndGUIButtons | undefined;
	private _mainDiv : HTMLDivElement | undefined;
	private _winText : HTMLParagraphElement | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div id="pauseGUIMainDiv" class="flex flex-col size-full  h-4/6 w-1/3 -translate-y-1/2 top-1/2 absolute">
				<p id="pauseGUIWinText" class="font-bold leading-normal text-[7vw] text-white text-center">WIN</p>
				${this.getButtonHTML("Restart", "pauseGUIRestart")}
				${this.getButtonHTML("Go To Menu", "pauseGUIGoToMenu")}
				${this.getButtonHTML("Quit", "pauseGUIQuit")}
			</div>
		`;
		this._buttons = {
			restart: this.querySelector<HTMLButtonElement>("button#pauseGUIRestart")!,
			goToMenu: this.querySelector<HTMLButtonElement>("button#pauseGUIGoToMenu")!,
			quit: this.querySelector<HTMLButtonElement>("button#pauseGUIQuit")!
		}
		this._mainDiv = this.querySelector<HTMLDivElement>("div#pauseGUIMainDiv")!;
		this._winText = this.querySelector<HTMLParagraphElement>("p#pauseGUIWinText")!;
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

	private	getButtonHTML(text : string, id : string)
	{
		return `<button id="${id}" class="text-[3vw] w-full mt-[10%] pointer-events-auto grow menu-button">${text}</button>`;
	}

	public getButtons() : EndGUIButtons | undefined
	{
		return this._buttons;
	}
}

customElements.define("end-gui", EndGUI);
