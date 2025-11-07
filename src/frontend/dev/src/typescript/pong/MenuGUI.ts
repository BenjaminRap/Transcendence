export class	MenuGUI extends HTMLElement
{
	private _buttonImageUrl? : string;
	private _buttonLeft? : HTMLInputElement;
	private _buttonRight? : HTMLInputElement;

	constructor(buttonImageUrl? : string)
	{
		super();
		this._buttonImageUrl = buttonImageUrl;
	}

	public static get observedAttributes() {
		return ['button-image-url'];
	}

	public attributeChangedCallback(name : string, _oldValue : string | null, newValue : string) {
		if (name === 'button-image-url')
		{
			this._buttonImageUrl = newValue;
			if (!this._buttonLeft || !this._buttonRight)
				return ;
			this._buttonLeft.src = newValue;
			this._buttonRight.src = newValue;
		}
	}

	public connectedCallback()
	{
		const	buttonImageUrl = this._buttonImageUrl ? `src="${this._buttonImageUrl}"` : "";

		console.log(buttonImageUrl);
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none");
		this.innerHTML = `
				<div class="bottom-0 left-1/2 absolute -translate-1/2 flex flex-row h-1/12 items-center w-1/4">
					${this.getButtonHTML("menuGUIButtonLeft", this._buttonImageUrl, "left")}
					<p class="h-2/3 grow-2 text-center line-he text-white bg-blue-500 font-semibold placeholder-yellow-100 rounded-full border-solid border-blue-300 border-[0.2vw] text-[2vw] leading-[normal] mx-[5%] bg-gradient-to-b from-cyan-500 to-blue-500" >Nature</p>
					${this.getButtonHTML("menuGUIButtonRight", this._buttonImageUrl, "right")}
				</div>`;
		this._buttonLeft = this.querySelector("input#menuGUIButtonLeft")!;
		this._buttonRight = this.querySelector("input#menuGUIButtonLeft")!;
		this._buttonLeft.addEventListener("click", console.log.bind("left !"));
		this._buttonLeft.addEventListener("click", console.log.bind("right !"));
	}

	private	getButtonHTML(id : string, imageUrl : string | undefined, side : "left" | "right") : string
	{
		const	src = imageUrl ? `src="${imageUrl}"` : "";
		const	rotate = (side == "right") ? "rotate-180" : "";

		return  `<input type="image" id="${id}" alt="" ${src} class="h-full hover:scale-115 hover:brightness-90 ${rotate} active:scale-90 active:brightness-75"></input>`;
	}

	public disconnectedCallback()
	{

	}
}

customElements.define("menu-gui", MenuGUI);
