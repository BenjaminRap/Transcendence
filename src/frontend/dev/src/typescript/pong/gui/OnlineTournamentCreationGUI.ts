import { Tournament } from "@shared/Tournament";
import type { IGUI } from "./IGUI";

export type OnlineTournamentCreationGUIInputs =
{
	create: HTMLButtonElement,
	createAndJoin: HTMLButtonElement,
	cancel: HTMLButtonElement
}

export class	OnlineTournamentCreationGUI extends HTMLElement implements IGUI<OnlineTournamentCreationGUIInputs>
{
	private _buttons : OnlineTournamentCreationGUIInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<fieldset class="text-(--text-color) font-(family-name:--font) h-1/2 w-11/12 border-(--border-color) border-solid border-(length:--border-width) m-auto mt-[1%] mb-[1%]">
				<legend class="m-auto pr-[2%] pl-[2%] text-[3.5cqw]">Tournament's settings</legend>
				<div class="ml-[30%] flex flex-col pointer-events-auto text-[2.5cqw]">
					<label>
						Name :
						<input class="ml-[1%] focus:border-(--border-color) focus:border-b-(length:--border-width) focus:outline-none" type="text" placeholder="Tournament" required>
					</label>
					<label>
						Is Public :
						<input class="ml-[1%] h-1/2 aspect-square accent-(--border-color)" type="checkbox">
					</label>
					<label>
						Max Players Count :
						<input class="ml-[1%] focus:border-(--border-color) focus:border-b-(length:--border-width) focus:outline-none w-1/12" type="number" min="2" max="${Tournament.maxTournamentParticipants}" step="1" placeholder="2" required>
					</label>
				</div>
			</fieldset>
			<div class="flex flex-col size-full h-1/2 w-1/4 m-auto">
				${this.getButtonHTML("Create", "OnlineTournamentCreationGUICreate")}
				${this.getButtonHTML("Create And Join", "OnlineTournamentCreationGUICreateAndJoin")}
				${this.getButtonHTML("Cancel", "OnlineTournamentCreationGUICancel")}
			</div>
		`;
		this._buttons = {
			create: this.querySelector("button.OnlineTournamentCreationGUICreate")!,
			createAndJoin: this.querySelector("button.OnlineTournamentCreationGUICreateAndJoin")!,
			cancel: this.querySelector("button.OnlineTournamentCreationGUICancel")!
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full h-[20%] mt-[8%] menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._buttons;
	}
}

customElements.define("online-tournament-creation-gui", OnlineTournamentCreationGUI);
