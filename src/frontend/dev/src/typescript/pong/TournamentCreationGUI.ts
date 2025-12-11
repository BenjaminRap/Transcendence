import { ProfileCreationGUI } from "./ProfileCreationGUI";

export class	TournamentCreationGUI extends HTMLElement
{
	private _profileContainer! : HTMLDivElement;
	private	_profiles : ProfileCreationGUI[] = [];

	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "flex", "flex-col");
		this.innerHTML = `
			<p class="text-[2vw] w-full text-center mb-[2vh] font-(family-name:--font)">Tournament</p>
			<div class="w-full" id="tournamentCreationGUIProfiles">
			</div>
			<button class="w-[7%] ml-[91%] mt-[3%] bg-green-300 rounded-md aspect-square hover:scale-125 transition-all" id="addProfile">
				<div class="w-3/5 aspect-square m-auto flex flex-col mt-[10%]">
					<div class="w-[13.8%] h-[45%] bg-black m-auto"></div>
					<div class="w-full h-[13.8%] bg-black"></div>
					<div class="w-[13.8%] h-[45%] bg-black m-auto"></div>
				</div>
			</button>
		`;
		this._profileContainer = this.querySelector("div#tournamentCreationGUIProfiles")!;
		const	addProfileButton = this.querySelector("button#addProfile")!;

		addProfileButton.addEventListener("click", () => this.addProfile());
		this.addProfile();
		this.addProfile();
		this.setProperties("var(--color-gray-400)", "100%");

	}

	private	addProfile()
	{
		const	newProfile = new ProfileCreationGUI();
		newProfile.classList.add("mb-[1vw]");
	
		this._profiles.push(newProfile);
		this._profileContainer.appendChild(newProfile);

		const	inputs = newProfile.getInputs()!;

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
}

customElements.define("tournament-creation-gui", TournamentCreationGUI);
