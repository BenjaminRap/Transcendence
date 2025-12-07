import { applyTheme, type ThemeName } from "./menuStyles";

export class	OpponentGUI extends HTMLElement
{
	private static readonly _unkownImageUrl : string = "/images/unkown.png";

	private	_image : string;
	private	_name : string;

	constructor(style? : ThemeName, name? : string, image? : string)
	{
		super();
		this._name = name ?? "unkown";
		this._image = image ?? OpponentGUI._unkownImageUrl;
		applyTheme(this, style ?? "basic");
	}

	connectedCallback()
	{
		this.classList.add("block", "border-solid", "border-black", "border-[0.2vw]", "rounded-3xl", "aspect-2/3");
		this.innerHTML = `
			<img src="${this._image}" class="m-auto mt-[5%] w-4/5 aspect-square" />
			<p class="mt-[10%] text-center text-[3vw]">${this._name}</p>
		`;
	}
}

customElements.define("opponent-gui", OpponentGUI);
