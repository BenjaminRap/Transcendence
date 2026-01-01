import type { Profile } from "@shared/Profile";
import { ProfileCreationGUI } from "./ProfileCreationGUI";

export type TournamentCreationGUIInputs = {
	start : HTMLButtonElement,
	cancel : HTMLButtonElement
}

export class	LocalTournamentCreationGUI extends HTMLElement
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
		this.classList.add("absolute", "inset-0", "size-full");
		this.innerHTML = `
			<div class="w-full h-2/3 top-1/3 relative flex flex-col">
				<div class="w-full h-2/3 overflow-scroll pointer-events-auto">
					<div class="w-full tournamentCreationGUIProfiles overflow-y-scroll h-1/3 inline">
					</div>
					<button class="tournamentCreationGUIAddProfile ml-[2.5%] w-[3%] bg-green-300 rounded-md aspect-square hover:scale-125 transition-all pointer-events-auto">
						<div class="aspect-square m-auto flex flex-col h-4/5">
							<div class="w-[13.8%] h-[45%] bg-black m-auto"></div>
							<div class="w-full h-[13.8%] bg-black"></div>
							<div class="w-[13.8%] h-[45%] bg-black m-auto"></div>
						</div>
					</button>
				</div>
				<div class="h-1/3">
					<div class="flex flex-col w-1/3 left-1/2 -translate-x-1/2 relative">
						${this.getButtonHTML("Start", "tournamentCreationGUIStart")}
						${this.getButtonHTML("Cancel", "tournamentCreationGUICancel")}
					</div>
				</div>
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
		return `<button class="${className} font-(family-name:--font) text-[3cqw] w-full mb-[10%] pointer-events-auto grow menu-button">${text}</button>`;
	}

	private	addProfile()
	{
		const	newProfile = new ProfileCreationGUI();
		newProfile.classList.add("mb-[0.5cqw]", "w-1/4", "ml-[3%]", "mr-[3%]", "mt-[0.5cqw]");
	
		this._profiles.push(newProfile);
		this._profileContainer.appendChild(newProfile);

		const	inputs = newProfile.getInputs()!;

		inputs.name.value = `player${this._currentPlayerId}`;
		this._currentPlayerId++;
		inputs.remove.addEventListener("click", () => this.removeProfile(newProfile));
		if (this._profiles.length === 3)
			this.setProperties("var(--color-red-300)", "120%");
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
			this.setProperties("var(--color-gray-400)", "100%");
	}
	
	private	setProperties(color : string, hoverScale : string)
	{
		this.style.setProperty("--remove-button-color", color);
		this.style.setProperty("--remove-button-hover-scale", hoverScale);
	}

	public reset()
	{
		this._profiles = [];
		this._profileContainer.replaceChildren();
		this.addProfile();
		this.addProfile();
		this.setProperties("var(--color-gray-400)", "100%");
	}

	private validate()
	{
		let	isValid = true;
	
		for (let index = 0; index < this._profiles.length; index++) {
			const profile = this._profiles[index];
			const inputs = profile.getInputs()!;
			
			if (inputs.name.value === "")
				profile.setErrorText("A profile name can not be empty !");
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
