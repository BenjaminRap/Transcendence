import { applyTheme, ThemeName } from "./menuStyles";

export class	TitleGUI extends HTMLElement
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
			<p class="absolute text-[15vw] top-0 left-(--title-left) text-(--title-color) -translate-x-1/2 font-(family-name:--title-font) text-shadow-(--title-shadow) transition-all duration-[1s]">PONG</p>
		`;
	}
}

customElements.define("title-gui", TitleGUI);
