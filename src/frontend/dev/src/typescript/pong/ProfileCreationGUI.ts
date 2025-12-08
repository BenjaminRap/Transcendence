import { applyTheme, type ThemeName } from "./menuStyles";

export class	ProfileCreationGUI extends HTMLElement
{
	constructor(style? : ThemeName)
	{
		super();
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("flex", "flex-row", "h-[5vh]", "items-center", "bg-gray-100", "w-fit", "gap-[3vw]");
		this.innerHTML = `
			<input type="text" placeholder="pseudo" class="border-black border-solid border-[0.1vw] ml-[1vw] p-[0.5vw] w-2/5">
			<input type="file" accept=".png,.jpg" class="file:bg-gray-300 file:p-[0.5vw] border-gray-300 border-[0.1vw] rounded-lg border-solid w-2/5">
			<button class="h-4/5 aspect-square bg-red-300 rounded-md mr-[1vw] text-[1vw]">
				<div class="w-3/5 h-1/12 bg-black m-auto"></div>
			</button>
		`;
	}
}

customElements.define("profile-creation-gui", ProfileCreationGUI);
