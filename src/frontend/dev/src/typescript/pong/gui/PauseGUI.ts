import type { IGUI } from "./IGUI";

export type PauseGUIInputs =
{
	continue : HTMLButtonElement,
	forfeit? : HTMLButtonElement,
	goToMenu : HTMLButtonElement
}

export class	PauseGUI extends HTMLElement implements IGUI<PauseGUIInputs>
{
	private _inputs : PauseGUIInputs;

	constructor(private _forfeitEnabled : boolean = true)
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col size-full h-4/6 w-1/3 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("Continue", "pauseGUIContinue")}
				${this._forfeitEnabled ? this.getButtonHTML("Forfeit", "pauseGUIForfeit") : ""}
				${this.getButtonHTML("Go To Menu", "pauseGUIGoToMenu")}
			</div>
		`;
		this._inputs = {
			continue: this.querySelector<HTMLButtonElement>("button.pauseGUIContinue")!,
			forfeit: this.querySelector<HTMLButtonElement>("button.pauseGUIForfeit") ?? undefined,
			goToMenu: this.querySelector<HTMLButtonElement>("button.pauseGUIGoToMenu")!
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full mt-[10%] grow menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("pause-gui", PauseGUI);
