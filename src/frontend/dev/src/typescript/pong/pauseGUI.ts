export type PauseGUIButtons =
{
	continue : HTMLButtonElement,
	restart : HTMLButtonElement,
	rematch?: HTMLButtonElement,
	goToMenu : HTMLButtonElement,
	quit : HTMLButtonElement
}

export class	PauseGUI extends HTMLElement
{
	private _type : "basic" | "colorful";
	private _buttons : PauseGUIButtons | undefined;
	private _rematchButtonEnabled : boolean;

	constructor(type? : "basic" | "colorful", rematchButtonEnabled? : boolean)
	{
		super();
		this._type = type ?? "basic";
		this._rematchButtonEnabled = rematchButtonEnabled ?? false;
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col size-full h-4/6 w-1/3 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("Continue", "pauseGUIContinue")}
				${this.getButtonHTML("Restart", "pauseGUIRestart")}
				${this._rematchButtonEnabled ? this.getButtonHTML("Rematch", "pauseGUIRematch") : ""}
				${this.getButtonHTML("Go To Menu", "pauseGUIGoToMenu")}
				${this.getButtonHTML("Quit", "pauseGUIQuit")}
			</div>
		`;
		this._buttons = {
			continue: this.querySelector<HTMLButtonElement>("button#pauseGUIContinue")!,
			restart: this.querySelector<HTMLButtonElement>("button#pauseGUIRestart")!,
			rematch: this.querySelector<HTMLButtonElement>("button#pauseGUIRematch") ?? undefined,
			goToMenu: this.querySelector<HTMLButtonElement>("button#pauseGUIGoToMenu")!,
			quit: this.querySelector<HTMLButtonElement>("button#pauseGUIQuit")!
		}
	}

	private	getButtonHTML(text : string, id : string)
	{
		return `<button id="${id}"class="border-white border-[0.3vw] backdrop-blur-md font-bold text-[3vw] leading-normal rounded-lg w-full mt-[10%] pointer-events-auto text-white grow hover:bg-white hover:scale-110 hover:text-black active:scale-95 transition-all">${text}</button>`;
	}

	public getButtons() : PauseGUIButtons | undefined
	{
		return this._buttons;
	}
}

customElements.define("pause-gui", PauseGUI);
