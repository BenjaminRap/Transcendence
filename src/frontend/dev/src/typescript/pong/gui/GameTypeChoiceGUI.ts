export type GameTypeChoiceGUIInputs = {
	twoVersusTwo : HTMLButtonElement,
	tournament : HTMLButtonElement,
	cancel : HTMLButtonElement
}

export class	GameTypeChoiceGUI extends HTMLElement
{
	private _inputs? : GameTypeChoiceGUIInputs;

	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col size-full h-4/6 w-1/4 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("2 vs 2", "GameTypeChoiceGUITwoVersusTwo")}
				${this.getButtonHTML("Tournament", "GameTypeChoiceGUITournament")}
				${this.getButtonHTML("Cancel", "GameTypeChoiceGUICancel")}
			</div>
		`;
		this._inputs = {
			twoVersusTwo: this.querySelector("button.GameTypeChoiceGUITwoVersusTwo")!,
			tournament: this.querySelector("button.GameTypeChoiceGUITournament")!,
			cancel: this.querySelector("button.GameTypeChoiceGUICancel")!
		}
	}

	public getInputs()
	{
		return this._inputs;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} font-(family-name:--font) text-[3vw] w-full mt-[22%] pointer-events-auto grow menu-button">${text}</button>`;
	}
}

customElements.define("game-type-choice-gui", GameTypeChoiceGUI);
