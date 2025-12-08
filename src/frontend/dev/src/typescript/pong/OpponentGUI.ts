import type { Profile } from "./FrontendTournament";
import { applyTheme, type ThemeName } from "./menuStyles";

const	defaultProfile : Profile = {
	name: "unkown",
	image : "/images/unkown.png"
}

export class	OpponentGUI extends HTMLElement
{
	constructor(style? : ThemeName, private _profile : Profile = defaultProfile)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("block", "border-solid", "border-black", "border-[0.2vw]", "rounded-3xl", "aspect-2/3");
		this.innerHTML = `
			<img src="${this._profile.image}" class="m-auto mt-[5%] w-4/5 aspect-square" />
			<p class="mt-[10%] text-center text-[3vw]">${this._profile.name}</p>
		`;
	}
}

customElements.define("opponent-gui", OpponentGUI);
