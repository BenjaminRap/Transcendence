export type PauseGUIButtons =
{
	continue : HTMLButtonElement,
	forfeit : HTMLButtonElement,
	goToMenu : HTMLButtonElement,
	quit : HTMLButtonElement
}

export class	PauseGUI extends HTMLElement
{
	private _buttons : PauseGUIButtons | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col size-full h-4/6 w-1/3 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("Continue", "pauseGUIContinue")}
				${this.getButtonHTML("Forfeit", "pauseGUIForfeit")}
				${this.getButtonHTML("Go To Menu", "pauseGUIGoToMenu")}
				${this.getButtonHTML("Quit", "pauseGUIQuit")}
			</div>
		`;
		this._buttons = {
			continue: this.querySelector<HTMLButtonElement>("button.pauseGUIContinue")!,
			forfeit: this.querySelector<HTMLButtonElement>("button.pauseGUIForfeit")!,
			goToMenu: this.querySelector<HTMLButtonElement>("button.pauseGUIGoToMenu")!,
			quit: this.querySelector<HTMLButtonElement>("button.pauseGUIQuit")!
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} font-(family-name:--font) text-[3vw] w-full mt-[10%] pointer-events-auto grow menu-button">${text}</button>`;
	}

	public getButtons() : PauseGUIButtons | undefined
	{
		return this._buttons;
	}
}

customElements.define("pause-gui", PauseGUI);
