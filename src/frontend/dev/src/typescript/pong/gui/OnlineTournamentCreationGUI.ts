import { TournamentHelper } from "@shared/TournamentHelper";
import type { IGUI } from "./IGUI";
import type { TournamentCreationSettings } from "@shared/ServerMessage";
import { PongError } from "@shared/pongError/PongError";

export type OnlineTournamentCreationGUIInputs = {
	create: HTMLButtonElement,
	cancel: HTMLButtonElement
}

type CustomInput<T extends "text" | "checkbox" | "number"> = {
	input: HTMLInputElement & {type: T},
	errorText : HTMLParagraphElement
}

type OnlineTournamentSettingsInputs = {
	name : CustomInput<"text">,
	isPublic : CustomInput<"checkbox">,
	maxPlayersCount : CustomInput<"number">
}

export class	OnlineTournamentCreationGUI extends HTMLElement implements IGUI<OnlineTournamentCreationGUIInputs>
{
	private _inputs : OnlineTournamentCreationGUIInputs | undefined;
	private _settingsInputs : OnlineTournamentSettingsInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<fieldset class="text-(--text-color) font-(family-name:--font) h-3/5 w-11/12 border-(--border-color) border-solid border-(length:--border-width) m-auto mt-[1%] mb-[1%]">
				<legend class="m-auto pr-[2%] pl-[2%] text-[3.5cqw]">Tournament's settings</legend>
				<div class="ml-[30%] flex flex-col pointer-events-auto text-[2.5cqw]">
					${this.getErrorText("onlineTournamentCreationGUINameErrorText")}
					<label>
						Name :
						<input class="ml-[1%] focus:border-(--border-color) focus:border-b-(length:--border-width) focus:outline-none onlineTournamentCreationGUIName" type="text" placeholder="Tournament" maxlength="${TournamentHelper.maxNameLength}" required>
					</label>
					${this.getErrorText("onlineTournamentCreationGUIIsPublicErrorText")}
					<label>
						Is Public :
						<input class="ml-[1%] h-1/2 aspect-square accent-(--border-color) onlineTournamentCreationGUIIsPublic" type="checkbox">
					</label>
					${this.getErrorText("onlineTournamentCreationGUIMaxPlayersCountErrorText")}
					<label>
						Max Players Count :
						<input class="ml-[1%] focus:border-(--border-color) focus:border-b-(length:--border-width) focus:outline-none w-1/12 onlineTournamentCreationGUIMaxPlayersCount" type="number" min="2" max="${TournamentHelper.maxTournamentParticipants}" step="1" placeholder="2" value="2" required>
					</label>
				</div>
			</fieldset>
			<div class="flex flex-col size-full h-1/2 w-1/4 m-auto">
				${this.getButtonHTML("Create", "onlineTournamentCreationGUICreate")}
				${this.getButtonHTML("Cancel", "onlineTournamentCreationGUICancel")}
			</div>
		`;
		this._inputs = {
			create: this.querySelector("button.onlineTournamentCreationGUICreate")!,
			cancel: this.querySelector("button.onlineTournamentCreationGUICancel")!
		};
		this._settingsInputs = {
			name: {
				input: this.querySelector("input.onlineTournamentCreationGUIName")!,
				errorText: this.querySelector("p.onlineTournamentCreationGUINameErrorText")!,
			},
			isPublic: {
				input: this.querySelector("input.onlineTournamentCreationGUIIsPublic")!,
				errorText: this.querySelector("p.onlineTournamentCreationGUIIsPublicErrorText")!,
			},
			maxPlayersCount: {
				input: this.querySelector("input.onlineTournamentCreationGUIMaxPlayersCount")!,
				errorText: this.querySelector("p.onlineTournamentCreationGUIMaxPlayersCountErrorText")!,
			}
		}
	}

	private	getErrorText(className : string)
	{
		return `<p class="${className} w-full text-red-900 bg-red-300/25 backdrop-blur-3xl text-center rounded-md invisible -translate-x-[20%]">Error</p>`;
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] w-full h-[20%] mt-[8%] menu-button">${text}</button>`;
	}

	public getInputs()
	{
		return this._inputs;
	}

	private	validate()
	{
		if (this._settingsInputs === undefined)
			throw new PongError("getOnlineTournamentSettings called before begin connected !", "quitPong");
		let	isValid = true;

		Object.values(this._settingsInputs).forEach(elem => {
			elem.input.value = elem.input.value.trim();
			if (elem.input.checkValidity())
				elem.errorText.classList.add("invisible");
			else
			{
				isValid = false;
				elem.errorText.textContent = `❌${elem.input.validationMessage}`;
				elem.errorText.classList.remove("invisible");
			}
		});
		return isValid;
	}

	public getOnlineTournamentSettings() : TournamentCreationSettings | null
	{
		if (this._settingsInputs === undefined)
			throw new PongError("getOnlineTournamentSettings called before begin connected !", "quitPong");
		if (!this.validate())
			return null;
		const	settings : TournamentCreationSettings = {
			name : this._settingsInputs.name.input.value,
			isPublic: this._settingsInputs.isPublic.input.checked,
			maxPlayerCount: this._settingsInputs.maxPlayersCount.input.valueAsNumber
		};
		return settings;
	}
}

customElements.define("online-tournament-creation-gui", OnlineTournamentCreationGUI);
