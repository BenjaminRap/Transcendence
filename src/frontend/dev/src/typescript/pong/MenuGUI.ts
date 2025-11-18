export type	OnItemChange = (currentIndex : number, newIndex : number) => boolean;
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

	constructor(buttonImageUrl? : string, sceneSwitch? : SwitchButton, enemyTypeSwitch? : SwitchButton)
	{
		super();
		this._buttonImageUrl = buttonImageUrl;
		this._sceneSwitch = sceneSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
		this._enemyTypeSwitch = enemyTypeSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
	}

	public connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
				<p class="absolute text-[15vw] top-0 left-1/3 -translate-x-1/3 font-[pixel]" style="text-shadow: 8px 8px 4px rgba(75, 80, 90, 1)">PONG</p>
				<div class="bottom-0 left-1/2 absolute -translate-1/2 flex flex-row h-1/12 items-center w-1/4">
					${this.getItemSwitchElement("menuGUISceneChange", this._sceneSwitch.items)}
				</div>
				<div class="bottom-1/5 left-4/5 absolute -translate-1/2 flex flex-row h-1/12 items-center w-1/4">
					${this.getItemSwitchElement("menuGUIEnemyChange", this._enemyTypeSwitch.items)}
				</div>
		`;
		this.addSwitchButtonListener("menuGUISceneChange", this._sceneSwitch);
		this.addSwitchButtonListener("menuGUIEnemyChange", this._enemyTypeSwitch);
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
			<div class="relative h-2/3 grow-2 text-center line-he text-white bg-blue-500 font-semibold placeholder-yellow-100 rounded-full border-solid border-blue-300 border-[0.2vw] text-[2vw] leading-[normal] mx-[5%] bg-gradient-to-b from-cyan-500 to-blue-500 overflow-hidden" >
				<div id="${idBase}ItemsContainer" class="size-full absolute transition-all ease-in-out">
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

		return  `<input type="image" id="${id}" alt="" ${src} class="h-full hover:scale-115 hover:brightness-90 ${rotate} active:scale-90 active:brightness-75 pointer-events-auto"></input>`;
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
