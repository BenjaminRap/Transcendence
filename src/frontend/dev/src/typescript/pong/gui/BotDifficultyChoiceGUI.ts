import type { IGUI } from "./IGUI";

export type BotDifficultyChoiceGUIInputs =
{
	easy : HTMLButtonElement,
	normal : HTMLButtonElement,
	hard : HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	BotDifficultyChoiceGUI extends HTMLElement implements IGUI<BotDifficultyChoiceGUIInputs>
{
	private _inputs : BotDifficultyChoiceGUIInputs;

	constructor()
	{
		super();
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col h-4/6 w-1/3 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButtonHTML("Easy", "BotDifficultyChoiceEasy")}
				${this.getButtonHTML("Normal", "BotDifficultyChoiceNormal")}
				${this.getButtonHTML("Hard", "BotDifficultyChoiceHard")}
				${this.getButtonHTML("Cancel", "BotDifficultyChoiceCancel")}
			</div>
		`;
		this._inputs = {
			easy : this.querySelector("button.BotDifficultyChoiceEasy")!,
			normal : this.querySelector("button.BotDifficultyChoiceNormal")!,
			hard : this.querySelector("button.BotDifficultyChoiceHard")!,
			cancel : this.querySelector("button.BotDifficultyChoiceCancel")!,
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

customElements.define("bot-difficulty-choice-gui", BotDifficultyChoiceGUI);
