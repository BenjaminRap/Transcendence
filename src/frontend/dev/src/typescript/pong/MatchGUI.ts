import { applyTheme, type ThemeName } from "./menuStyles";

export class	MatchGUI extends HTMLElement
{
	private static readonly _matchUrl : string = "/images/fight.png";

	constructor(style? : ThemeName)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("block", "border-solid", "border-black", "border-[0.2vw]", "rounded-3xl", "aspect-2/3");
		this.innerHTML = `
			<img src="${MatchGUI._matchUrl}" class="m-auto w-4/5 h-auto mt-[46%]" />
		`;
	}
}

customElements.define("match-gui", MatchGUI);
