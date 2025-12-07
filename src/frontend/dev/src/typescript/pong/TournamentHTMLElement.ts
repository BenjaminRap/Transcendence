import { applyTheme, type ThemeName } from "./menuStyles";

export class	TournamentGUI extends HTMLElement
{
	constructor(style? : ThemeName)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none");
	}
}

customElements.define("tournament-gui", TournamentGUI);
