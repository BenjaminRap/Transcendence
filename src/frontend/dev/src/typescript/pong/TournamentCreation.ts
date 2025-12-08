import { applyTheme, type ThemeName } from "./menuStyles";

export class	TournamentCreationGUI extends HTMLElement
{
	constructor(style? : ThemeName)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "flex", "flex-col");
		this.innerHTML = `
			<p>Tournament</p>
			<div></div>
		`;
	}
}

customElements.define("tournament-creation-gui", TournamentCreationGUI);
