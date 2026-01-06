import type { Profile } from "@shared/Profile";
import { ProfileCreationGUI } from "./ProfileCreationGUI";
import type { IGUI } from "./IGUI";
import { TournamentHelper } from "@shared/Tournament";

export type TournamentCreationGUIInputs = {
	start : HTMLButtonElement,
	cancel : HTMLButtonElement
}

export class	LocalTournamentCreationGUI extends HTMLElement implements IGUI<TournamentCreationGUIInputs>
{
	private _profileContainer! : HTMLDivElement;
	private	_profiles : ProfileCreationGUI[] = [];
	private _inputs? : TournamentCreationGUIInputs;
	private _currentPlayerId = 0;

	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "backdrop-blur-sm", "flex", "flex-col");
		this.innerHTML = `
				<fieldset class="w-11/12 h-2/3 overflow-y-scroll pointer-events-auto border-solid border-(--border-color) border-(length:--border-width) mt-[1%] m-auto scrollbar scrollbar-thumb-white scrollbar-track-[transparent] cursor-all-scroll">

				<legend class="m-auto pr-[2%] pl-[2%] text-(--text-color) text-[3.5cqw] font-(family-name:--font)">Participants</legend>
				<div class="tournamentCreationGUIProfiles inline">
				</div>
				<button class="tournamentCreationGUIAddProfile ml-[2.5%] w-[3%] bg-(--add-button-color) rounded-md aspect-square hover:scale-(--add-button-hover-scale) transition-all pointer-events-auto">
					<div class="aspect-square m-auto flex flex-col h-4/5">
						<div class="w-[13.8%] h-[45%] bg-black m-auto"></div>
						<div class="w-full h-[13.8%] bg-black"></div>
						<div class="w-[13.8%] h-[45%] bg-black m-auto"></div>
					</div>
				</button>
			</fieldset>
			<div class="flex flex-col size-full h-1/3 w-1/3 m-auto mt-[1%]">
				${this.getButtonHTML("Start", "tournamentCreationGUIStart")}
				${this.getButtonHTML("Cancel", "tournamentCreationGUICancel")}
			</div>
		`;
		this._profileContainer = this.querySelector("div.tournamentCreationGUIProfiles")!;
		const	addProfileButton = this.querySelector("button.tournamentCreationGUIAddProfile")!;

		addProfileButton.addEventListener("click", () => this.addProfile());
		this.reset();
		this._inputs = {
			start : this.querySelector("button.tournamentCreationGUIStart")!,
			cancel : this.querySelector("button.tournamentCreationGUICancel")!
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} text-[3cqw] m-auto mt-[2%] w-full h-1/3 menu-button">${text}</button>`;
	}

	private	addProfile()
	{
		if (this._profiles.length >= TournamentHelper.maxTournamentParticipants)
			return ;
		const	newProfile = new ProfileCreationGUI();
		newProfile.classList.add("mb-[0.5cqw]", "w-1/4", "ml-[3%]", "mr-[3%]", "mt-[0.5cqw]");
	
		this._profiles.push(newProfile);
		this._profileContainer.appendChild(newProfile);

		const	inputs = newProfile.getInputs()!;

		inputs.name.value = `player${this._currentPlayerId}`;
		this._currentPlayerId++;
		inputs.remove.addEventListener("click", () => this.removeProfile(newProfile));
		if (this._profiles.length === 3)
			this.setCanRemove(true);
		if (this._profiles.length === TournamentHelper.maxTournamentParticipants)
			this.setCanAdd(false);
	}

	private	removeProfile(element : ProfileCreationGUI)
	{
		if (this._profiles.length <= 2)
			return ;
		const	index = this._profiles.indexOf(element);
		if (index !== -1)
			this._profiles.splice(index, 1);
		element.remove();
		if (this._profiles.length === 2)
			this.setCanRemove(false);
		else if (this._profiles.length === TournamentHelper.maxTournamentParticipants - 1)
			this.setCanAdd(true);
	}

	private	setCanRemove(canRemove : boolean)
	{
		const	color = canRemove ? "var(--color-red-300)" : "var(--color-gray-400)";
		const	hoverScale = canRemove ? "120%" : "100%";


		this.style.setProperty("--remove-button-color", color);
		this.style.setProperty("--remove-button-hover-scale", hoverScale);
	}

	private setCanAdd(canAdd : boolean)
	{
		const	color = canAdd ? "var(--color-green-300)" : "var(--color-gray-400)";
		const	hoverScale = canAdd ? "125%" : "100%";


		this.style.setProperty("--add-button-color", color);
		this.style.setProperty("--add-button-hover-scale", hoverScale);
	}

	public reset()
	{
		this._profiles = [];
		this._profileContainer.replaceChildren();
		for (let index = 0; index < 2; index++) {
			this.addProfile();
		}
		this.setCanRemove(false);
		this.setCanAdd(TournamentHelper.maxTournamentParticipants > 2);
	}

	private validate()
	{
		let	isValid = true;
	
		for (let index = 0; index < this._profiles.length; index++) {
			const profile = this._profiles[index];
			const inputs = profile.getInputs()!;


			inputs.name.value = inputs.name.value.trim();
			
			if (inputs.name.value === "")
				profile.setErrorText("A profile name can not be empty !");
			else if (inputs.name.value.length > TournamentHelper.maxNameLength)
				profile.setErrorText(`A profile name can not be longer than ${TournamentHelper.maxNameLength} !`);
			else if (this._profiles.filter((value) => value.getInputs()!.name.value === inputs.name.value).length > 1)
				profile.setErrorText("The profile name is duplicated !")
			else
			{
				profile.clearError();
				continue ;
			}
			isValid = false;
		}
		return isValid;
	}

	public getProfiles() : Profile[] | null
	{
		if (!this.validate())
			return null;
		return this._profiles.map((profileGUI) => profileGUI.createProfile());
	}

	public getInputs()
	{
		return this._inputs;
	}
}

customElements.define("tournament-creation-gui", LocalTournamentCreationGUI);
