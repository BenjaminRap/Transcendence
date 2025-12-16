export type	ProfileCreationInputs = {
	name : HTMLInputElement,
	image : HTMLInputElement,
	remove : HTMLButtonElement
}

export class	ProfileCreationGUI extends HTMLElement
{
	private _inputs? : ProfileCreationInputs;
	private _errorText? : HTMLParagraphElement;

	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("inline-flex", "flex-col");
		this.innerHTML = `
			<p class="profileCreationGUIErrorText w-full text-red-900 bg-red-300/25 backdrop-blur-3xl mb-[0.5vw] text-center rounded-md invinsible"></p>
			<div class="flex flex-row items-center gap-[1vw] aspect-10/1 pointer-events-auto border-solid border-(length:--profile-border-width) border-(--border-color) rounded-(--rounded) p-[0.2vw] bg-(image:--background-image) backdrop-blur-(--backdrop-blur)">
				<div class="ml-[1vw] p-[0.1vw] w-2/5 border-[0.1vw] border-(--file-color) border-solid">
					<input type="text" placeholder="pseudo" class="text-[0.75vw] w-full outline-none border-transparent border-solid border-b-[0.2vw] focus:border-blue-400 transition-all duration-75 font-(family-name:--font) text-(--profile-text-color) placeholder-(--profile-text-color) h-11/12">
				</div>
				<input type="file" accept=".png,.jpg" class="text-[0.75vw] file:bg-(--file-color) file:font(family-name:--font) file:text-(--file-text-color) file:p-[0.5vw] border-(--file-color) border-[0.1vw] rounded-lg border-solid w-3/5 hover:scale-[105%] transition-all font-(family-name:--font) text-(--profile-text-color)">
				<button class="h-[110%] aspect-square bg-(--remove-button-color) rounded-md mr-[1vw] hover:scale-(--remove-button-hover-scale) transition-all">
					<div class="w-3/5 h-1/12 bg-black m-auto"></div>
				</button>
			</div>
		`;
		this._inputs = {
			name: this.querySelector("input[type='text']")!,
			image: this.querySelector("input[type='file']")!,
			remove : this.querySelector("button")!
		}
		this._errorText = this.querySelector("p.ProfileCreationGUI")!;
	}

	public getInputs()
	{
		return this._inputs
	}

	public setErrorText(errorText : string)
	{
		if (!this._errorText)
			return ;
		this._errorText.textContent = `❌${errorText}`;
		this._errorText.classList.remove("invinsible");
	}

	public clearError()
	{
		this._errorText?.classList.add("invinsible");
	}
}

customElements.define("profile-creation-gui", ProfileCreationGUI);
