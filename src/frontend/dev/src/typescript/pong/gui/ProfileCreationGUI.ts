export type	ProfileCreationInputs = {
	name : HTMLInputElement,
	image : HTMLInputElement,
	remove : HTMLButtonElement
}

export class	ProfileCreationGUI extends HTMLElement
{
	private _inputs? : ProfileCreationInputs;

	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("inline-flex", "flex-row", "items-center", "bg-gray-100", "gap-[3vw]", "aspect-10/1", "pointer-events-auto");
		this.innerHTML = `
			<div class="ml-[1vw] p-[0.5vw] w-2/5 border-[0.1vw] border-black border-solid">
				<input type="text" placeholder="pseudo" class="text-[0.75vw] w-full outline-none border-transparent border-solid border-b-[0.2vw] focus:border-blue-400 transition-all duration-75 font-(family-name:--font) h-4/5">
			</div>
			<input type="file" accept=".png,.jpg" class="text-[0.75vw] file:bg-gray-300 file:p-[0.5vw] border-gray-300 border-[0.1vw] rounded-lg border-solid w-3/5 hover:scale-[105%] transition-all font-(family-name:--font)">
			<button class="h-4/5 aspect-square bg-(--remove-button-color) rounded-md mr-[1vw] hover:scale-(--remove-button-hover-scale) transition-all">
				<div class="w-3/5 h-1/12 bg-black m-auto"></div>
			</button>
		`;
		this._inputs = {
			name: this.querySelector("input[type='text']")!,
			image: this.querySelector("input[type='file']")!,
			remove : this.querySelector("button")!
		}
	}

	public getInputs = () => this._inputs;
}

customElements.define("profile-creation-gui", ProfileCreationGUI);
