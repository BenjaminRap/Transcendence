import type { Profile } from "@shared/Profile";
import { TournamentHelper } from "@shared/TournamentHelper";

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
			<p class="profileCreationGUIErrorText w-full text-red-900 bg-red-300/25 backdrop-blur-3xl mb-[0.5cqw] text-center rounded-md invisible">Error</p>
			<div class="flex flex-row items-center gap-[1cqw] aspect-10/1 pointer-events-auto border-solid border-(length:--profile-border-width) border-(--border-color) rounded-(--rounded) p-[0.2cqw] bg-(image:--background-image) backdrop-blur-(--backdrop-blur)">
				<div class="ml-[1cqw] p-[0.1cqw] w-2/5 border-[0.1cqw] border-(--file-color) border-solid">
					<input type="text" maxlength="${TournamentHelper.maxNameLength}" placeholder="pseudo" class="text-[0.75cqw] w-full outline-none border-transparent border-solid border-b-[0.2cqw] focus:border-(--file-color) transition-all duration-75 font-(family-name:--font) text-(--profile-text-color) placeholder-(--profile-text-color) h-11/12">
				</div>
				<input type="file" accept=".png,.jpg" class="text-[0.75cqw] file:bg-(--file-color) file:font(family-name:--font) file:text-(--file-text-color) file:p-[0.5cqw] border-(--file-color) border-[0.1cqw] rounded-lg border-solid w-3/5 hover:scale-[105%] transition-all font-(family-name:--font) text-(--profile-text-color)">
				<button class="h-[110%] aspect-square bg-(--remove-button-color) rounded-md mr-[1cqw] hover:scale-(--remove-button-hover-scale) transition-all">
					<div class="w-3/5 h-1/12 bg-black m-auto"></div>
				</button>
			</div>
		`;
		this._inputs = {
			name: this.querySelector("input[type='text']")!,
			image: this.querySelector("input[type='file']")!,
			remove : this.querySelector("button")!
		}
		this._errorText = this.querySelector("p.profileCreationGUIErrorText")!;
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
		this._errorText.classList.remove("invisible");
	}

	public clearError()
	{
		this._errorText?.classList.add("invisible");
	}

	public createProfile() : Profile
	{
		return {
			name: this._inputs!.name.value,
			image: this._inputs!.image.value
		}
	}
}

customElements.define("profile-creation-gui", ProfileCreationGUI);
