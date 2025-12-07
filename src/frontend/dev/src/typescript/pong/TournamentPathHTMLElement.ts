import { applyTheme, type ThemeName } from "./menuStyles";

export class	TournamentPathGUI extends HTMLElement
{
	constructor(style? : ThemeName)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("flex", "flex-col");
		this.innerHTML = `
			<div class="w-[1vw] bg-black m-auto h-1/2"></div>
			<div class="w-full border-[1vw] border-b-0 border-black h-1/2 box-border rounded-t-md"></div>
		`;
	}
}

customElements.define("tournament-path-gui", TournamentPathGUI);
