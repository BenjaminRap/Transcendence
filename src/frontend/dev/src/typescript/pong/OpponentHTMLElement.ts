import { applyTheme, type ThemeName } from "./menuStyles";

export class	OpponentGUI extends HTMLElement
{
	constructor(style? : ThemeName)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
		`;
	}
}

customElements.define("opponent-gui", OpponentGUI);
