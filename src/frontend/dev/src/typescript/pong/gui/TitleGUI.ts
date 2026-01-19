import type { IGUI } from "./IGUI";

export class	TitleGUI extends HTMLElement implements IGUI<void>
{
	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
			<p class="absolute text-[15cqw] top-0 left-(--title-left) text-(--title-color) -translate-x-1/2 font-(family-name:--font) text-shadow-(--title-shadow) transition-all duration-[1s]">PONG</p>
		`;
	}

	public getInputs() {
		return undefined;
	}
}

customElements.define("title-gui", TitleGUI);
