export type	OnItemChange = (currentIndex : number, newIndex : number) => boolean;
export type OnPlay = (sceneIndex : number, enemyTypeIndex : number) => void;

export interface SwitchButton {
	items : string[],
	currentItemIndex : number,
	onItemChange : OnItemChange | null
}

export class	MenuGUI extends HTMLElement
{
	private _sceneSwitch : SwitchButton;
	private _enemyTypeSwitch : SwitchButton;
	private _onPlay : OnPlay | null;

	constructor(sceneSwitch? : SwitchButton, enemyTypeSwitch? : SwitchButton, onPlay? : OnPlay)
	{
		super();
		this._sceneSwitch = sceneSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
		this._enemyTypeSwitch = enemyTypeSwitch ?? {items : [], currentItemIndex: 0, onItemChange: null};
		this._onPlay = onPlay ?? null;
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
				<div class="bottom-1/5 absolute flex flex-row items-center w-full h-1/12 justify-between">
					<div class="w-1/4 flex flex-row items-center h-full">
						${this.getItemSwitchElement("menuGUISceneChange", this._sceneSwitch.items)}
					</div>
					<div class="w-1/4 flex flex-row items-center h-full">
						${this.getItemSwitchElement("menuGUIEnemyChange", this._enemyTypeSwitch.items)}
					</div>
				</div>
				${this.getPlayButton("menuGUIPlayButton")}
		`;
		this.addSwitchButtonListener("menuGUISceneChange", this._sceneSwitch);
		this.addSwitchButtonListener("menuGUIEnemyChange", this._enemyTypeSwitch);
		if (this._onPlay)
			this.querySelector("button.menuGUIPlayButton")!.addEventListener("click", () => this._onPlay!(this._sceneSwitch.currentItemIndex, this._enemyTypeSwitch.currentItemIndex));
	}

	private addSwitchButtonListener(classNameBase : string, switchButton : SwitchButton)
	{
		const	buttonLeft = this.querySelector(`button.${classNameBase}ButtonLeft`)!;
		const	buttonRight = this.querySelector(`button.${classNameBase}ButtonRight`)!;
		const	container = this.querySelector<HTMLDivElement>(`div.${classNameBase}ItemsContainer`)!;

		buttonLeft.addEventListener("click", () => this.switchItems("left", container, switchButton));
		buttonRight.addEventListener("click", () => this.switchItems("right", container, switchButton));
	}

	private	getPlayButton(className : string)
	{
		return `<button class="${className} absolute bottom-0 left-1/2 -translate-1/2 h-1/12 w-1/4 text-[3cqw] pointer-events-auto menu-button">Play</button>`;
	}

	private	getItemSwitchElement(classNameBase : string, items : string[])
	{
		const	itemsHTML = items.reduce((accumulator : string, item : string, index : number) => {
			const	left = 50 + index * 100;

			return accumulator + `<p class="absolute -translate-1/2 top-1/2" style="left:${left}%">${item}</p>`
		}, "");
		return `
			${this.getButtonHTML(`${classNameBase}ButtonLeft`, "left")}
			<div class="relative h-2/3 grow-2 text-[2cqw] mx-[5%] overflow-hidden menu-button pointer-events-none" >
				<div class="${classNameBase}ItemsContainer size-full absolute transition-all ease-in-out left-0">
					${itemsHTML}
				</div>
			</div>
			${this.getButtonHTML(`${classNameBase}ButtonRight`, "right")}
		`;
	}

	private	getButtonHTML(className : string, side : "left" | "right") : string
	{
		const	rotate = (side == "right") ? "rotate-y-180" : "";

		return  `<button alt="" class="${className} h-full w-[14%] font-(family-name:--font) hover:scale-(--hover-scale) hover:brightness-(--hover-brightness) ${rotate} active:scale-(--active-scale) active:brightness-(--active-brightness) pointer-events-auto bg-(image:--switch-button-image) transition-all bg-contain bg-no-repeat bg-center hover:bg-(image:--switch-button-image-hover) hover:animate-(--hover-animation)">
	
</button>`;
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
