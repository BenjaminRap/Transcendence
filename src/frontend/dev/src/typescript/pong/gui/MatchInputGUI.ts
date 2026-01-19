export class	MatchInputGUI extends HTMLElement
{
	private static readonly _inputImage = new Map<string, string>([
		["ArrowUp", "/images/ArrowUp.png"],
		["ArrowDown", "/images/ArrowDown.png"]
	]);

	constructor(private _upKey : string = "z", private _downKey : string = "s")
	{
		super();
	}

	public connectedCallback()
	{
		this.classList.add("flex", "flex-col", "aspect-3/7", "justify-between");
		this.innerHTML = `
			${this.getKeyHTML(this._upKey)}
			${this.getKeyHTML(this._downKey)}
		`;
	}

	private	getKeyHTML(key : string)
	{
		const	imageUrl = MatchInputGUI._inputImage.get(key);
		
		if (imageUrl === undefined)
			return `<p class="w-full aspect-square text-[3cqw] text-center text-(--text-color) border-solid border-(--border-color) border-(length:--border-width)">${key}</p>`;
		return `
			<div class="w-full aspect-square border-solid border-(--border-color) border-(length:--border-width)">
				<div class="w-full aspect-square mask-no-repeat mask-contain mask-center bg-(--border-color)" style="mask-image: url(${imageUrl}");>
				</div>
			</div>`;

	}
}

customElements.define("match-input-gui", MatchInputGUI);
