import type { Profile } from "../FrontendTournament";

const	defaultProfile : Profile = {
	name: "unkown",
	image : "/images/unkown.png"
}

export class	OpponentGUI extends HTMLElement
{
	constructor(private _profile : Profile = defaultProfile)
	{
		if (_profile.name === "")
			_profile.name = defaultProfile.name;
		if (_profile.image === "")
			_profile.image = defaultProfile.image;
		super();
	}

	connectedCallback()
	{
		this.classList.add("block", "border-solid", "border-black", "border-[0.2vw]", "rounded-3xl", "aspect-2/3");
		this.innerHTML = `
			<img src="${this._profile.image}" class="m-auto mt-[5%] w-4/5 aspect-square" />
			<p class="mt-[10%] font-(family-name:--font) text-center text-[3vw]">${this._profile.name}</p>
		`;
	}
}

customElements.define("opponent-gui", OpponentGUI);
