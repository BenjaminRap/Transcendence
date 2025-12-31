import type { Profile } from "@shared/Profile";

const	defaultProfile : Profile = {
	name: "unkown",
	image : "/images/unkown.png",
	score: 0
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
		this.classList.add("block", "border-solid", "rounded-(--rounded)", "aspect-2/3", "border-(--border-color)", "border-(length:--border-width)", "bg-(image:--background-image)", "bg-(--background-color)");
		this.innerHTML = `
			<img src="${this._profile.image}" class="m-auto mt-[5%] w-4/5 aspect-square pointer-events-none" />
			<p class="mt-[10%] font-(family-name:--font) text-center text-(length:--opponent-font-size) text-(--text-color) text-wrap overflow-hidden">${this._profile.name}</p>
		`;
	}
}

customElements.define("opponent-gui", OpponentGUI);
