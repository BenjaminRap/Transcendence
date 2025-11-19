export type	OnItemChange = (currentIndex : number, newIndex : number) => boolean;
export type OnPlay = (sceneIndex : number, enemyTypeIndex : number, skinIndex : number) => void;
export interface SwitchButton {
	items : string[],
	currentItemIndex : number,
	onItemChange : OnItemChange | null
}

export class	MenuGUI extends HTMLElement
{
	private _buttonImageUrl? : string;
	private _sceneSwitch : SwitchButton;
	private _enemyTypeSwitch : SwitchButton;
	private _skinsSwitch : SwitchButton;
	private _onPlay : OnPlay | null;

	constructor(buttonImageUrl? : string, sceneSwitch? : SwitchButton, enemyTypeSwitch? : SwitchButton, skinsSwitch? : SwitchButton, onPlay? : OnPlay)
	{
		super();
		this._buttonImageUrl = buttonImageUrl;
		this._sceneSwitch = sceneSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
		this._enemyTypeSwitch = enemyTypeSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
		this._skinsSwitch = skinsSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
		this._onPlay = onPlay ?? null;
	}

	public connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
				<p class="absolute text-[15vw] top-0 left-1/3 -translate-x-1/3 font-[pixel]" style="text-shadow: 8px 8px 4px rgba(75, 80, 90, 1)">PONG</p>
				<div class="bottom-1/5 absolute flex flex-row items-center w-full h-1/12 justify-between">
					<div class="w-1/4 flex flex-row items-center h-full">
						${this.getItemSwitchElement("menuGUISkinChange", this._skinsSwitch.items)}
					</div>
					<div class="w-1/4 flex flex-row items-center h-full translate-y-1/2">
						${this.getItemSwitchElement("menuGUISceneChange", this._sceneSwitch.items)}
					</div>
					<div class="w-1/4 flex flex-row items-center h-full">
						${this.getItemSwitchElement("menuGUIEnemyChange", this._enemyTypeSwitch.items)}
					</div>
				</div>
				<button id="menuGUIPlayButton" class="absolute bottom-0 left-1/2 -translate-1/2 h-1/12 w-1/4 text-center line-he text-white bg-blue-500 font-semibold rounded-full border-solid border-red-300 border-[0.3vw] text-[3vw] leading-[normal] bg-gradient-to-b from-amber-600 to-red-500 hover:scale-115 hover:brightness-90 active:scale-90 active:brightness-75 pointer-events-auto transition-all">Play</button>
		`;
		this.addSwitchButtonListener("menuGUISkinChange", this._skinsSwitch);
		this.addSwitchButtonListener("menuGUISceneChange", this._sceneSwitch);
		this.addSwitchButtonListener("menuGUIEnemyChange", this._enemyTypeSwitch);
		if (this._onPlay)
			this.querySelector("button#menuGUIPlayButton")!.addEventListener("click", () => this._onPlay!(this._sceneSwitch.currentItemIndex, this._enemyTypeSwitch.currentItemIndex, this._skinsSwitch.currentItemIndex));
	}

	private addSwitchButtonListener(baseId : string, switchButton : SwitchButton)
	{
		const	buttonLeft = this.querySelector(`input#${baseId}ButtonLeft`)!;
		const	buttonRight = this.querySelector(`input#${baseId}ButtonRight`)!;
		const	container = this.querySelector<HTMLDivElement>(`div#${baseId}ItemsContainer`)!;

		buttonLeft.addEventListener("click", () => this.switchItems("left", container, switchButton));
		buttonRight.addEventListener("click", () => this.switchItems("right", container, switchButton));
	}

	private	getItemSwitchElement(idBase : string, items : string[])
	{
		const	itemsHTML = items.reduce((accumulator : string, item : string, index : number) => {
			const	left = 50 + index * 100;

			return accumulator + `<p class="absolute -translate-x-1/2" style="left:${left}%">${item}</p>`
		}, "");
		return `
			${this.getButtonHTML(`${idBase}ButtonLeft`, this._buttonImageUrl, "left")}
			<div class="relative h-2/3 grow-2 text-center line-he text-white bg-blue-500 font-semibold rounded-full border-solid border-blue-300 border-[0.2vw] text-[2vw] leading-[normal] mx-[5%] bg-gradient-to-b from-cyan-500 to-blue-500 overflow-hidden" >
				<div id="${idBase}ItemsContainer" class="size-full absolute transition-all ease-in-out left-0">
					${itemsHTML}
				</div>
			</div>
			${this.getButtonHTML(`${idBase}ButtonRight`, this._buttonImageUrl, "right")}
		`;
	}

	private	getButtonHTML(id : string, imageUrl : string | undefined, side : "left" | "right") : string
	{
		const	src = imageUrl ? `src="${imageUrl}"` : "";
		const	rotate = (side == "right") ? "rotate-180" : "";

		return  `<input type="image" id="${id}" alt="" ${src} class="h-full hover:scale-115 hover:brightness-90 ${rotate} active:scale-90 active:brightness-75 pointer-events-auto transition-all"></input>`;
	}

	private	switchItems(side : "left" | "right", container : HTMLDivElement, switchButton : SwitchButton)
	{
		const	newIndex = switchButton.currentItemIndex + ((side === "left") ? -1 : 1);
		if (newIndex < 0 || newIndex >= switchButton.items.length)
			return ;
		if (switchButton.onItemChange
			&& !switchButton.onItemChange(switchButton.currentItemIndex, newIndex))
		{
			return ;
		}
		switchButton.currentItemIndex = newIndex;

		const	leftString = container.style.left;
		const	left = (leftString === "") ? 0 : parseInt(leftString);
		const	newLeft = left + ((side === "left") ? 100 : -100);
		
		container.style.left = newLeft + "%";
	}
}

customElements.define("menu-gui", MenuGUI);
