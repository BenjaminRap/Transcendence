type MenuGUIButtons = {
	sceneChangeLeft : HTMLInputElement;
	sceneChangeRight : HTMLInputElement;
}

export type	OnSceneChange = (currentIndex : number, newIndex : number) => void;

export class	MenuGUI extends HTMLElement
{
	private _buttonImageUrl? : string;
	private _buttons? : MenuGUIButtons;
	private _mapsContainer? : HTMLDivElement;
	private _maps : string[];
	private _currentMapIndex = 0;
	private _onSceneChange? : OnSceneChange;

	constructor(buttonImageUrl? : string, maps? : string[], onSceneChange? : OnSceneChange)
	{
		super();
		this._buttonImageUrl = buttonImageUrl;
		this._maps = maps ?? [];
		this._onSceneChange = onSceneChange;
	}

	public static get observedAttributes() {
		return ['button-image-url'];
	}

	public attributeChangedCallback(name : string, _oldValue : string | null, newValue : string) {
		if (name === 'button-image-url')
		{
			this._buttonImageUrl = newValue;
			if (!this._buttons)
				return ;
			this._buttons.sceneChangeLeft.src = newValue;
			this._buttons.sceneChangeRight.src = newValue;
		}
	}

	public connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
				<div class="bottom-0 left-1/2 absolute -translate-1/2 flex flex-row h-1/12 items-center w-1/4">
					${this.getButtonHTML("menuGUIButtonLeft", this._buttonImageUrl, "left")}
					<div class="relative h-2/3 grow-2 text-center line-he text-white bg-blue-500 font-semibold placeholder-yellow-100 rounded-full border-solid border-blue-300 border-[0.2vw] text-[2vw] leading-[normal] mx-[5%] bg-gradient-to-b from-cyan-500 to-blue-500 overflow-hidden" >
						<div id="menuGUIMapsNameContainer" class="size-full absolute transition-all ease-in-out"></div>
					</div>
					${this.getButtonHTML("menuGUIButtonRight", this._buttonImageUrl, "right")}
				</div>`;
		const	mapsNameContainer = this.querySelector<HTMLDivElement>("div#menuGUIMapsNameContainer")!;
		this._maps.forEach((map : string, index : number) => {
			const	left = 50 + index * 100;
			mapsNameContainer.innerHTML += `<p class="absolute -translate-x-1/2" style="left:${left}%">${map}</p>`
		});
		this._buttons = {
			sceneChangeLeft: this.querySelector("input#menuGUIButtonLeft")!,
			sceneChangeRight: this.querySelector("input#menuGUIButtonRight")!
		};
		this._mapsContainer = this.querySelector("div#menuGUIMapsNameContainer")!;
		this._buttons.sceneChangeLeft.addEventListener("click", () => this.switchMap("left"));
		this._buttons.sceneChangeRight.addEventListener("click", () => this.switchMap("right"));
	}

	private	getButtonHTML(id : string, imageUrl : string | undefined, side : "left" | "right") : string
	{
		const	src = imageUrl ? `src="${imageUrl}"` : "";
		const	rotate = (side == "right") ? "rotate-180" : "";

		return  `<input type="image" id="${id}" alt="" ${src} class="h-full hover:scale-115 hover:brightness-90 ${rotate} active:scale-90 active:brightness-75 pointer-events-auto"></input>`;
	}

	private switchMap(side : "left" | "right")
	{
		const	newIndex = this._currentMapIndex + ((side === "left") ? -1 : 1);
		if (newIndex < 0 || newIndex >= this._maps.length)
			return ;
		const	leftString = this._mapsContainer!.style.left;
		const	left = (leftString === "") ? 0 : parseInt(leftString);
		const	newLeft = left + ((side === "left") ? 100 : -100);
		

		this._mapsContainer!.style.left = newLeft + "%";
		if (this._onSceneChange)
			this._onSceneChange(this._currentMapIndex, newIndex);
		this._currentMapIndex = newIndex;
	}
}

customElements.define("menu-gui", MenuGUI);
