export class	PauseGUI extends HTMLElement
{
	private _type : "basic" | "colorful";

	constructor(type? : "basic" | "colorful")
	{
		super();
		this._type = type ?? "basic";
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none", "backdrop-blur-sm");
		this.innerHTML = `
			<div class="flex flex-col size-full h-4/6 w-1/3 left-1/2 -translate-1/2 top-1/2 absolute">
				${this.getButton("Continue")}
				${this.getButton("Restart")}
				${this.getButton("Go To Menu")}
				${this.getButton("Quit")}
			</div>
		`;
	}

	private	getButton(text : string)
	{
		return `<button class="border-white border-[0.3vw] backdrop-blur-md font-bold text-[3vw] leading-normal rounded-lg w-full mt-[10%] pointer-events-auto text-white grow hover:bg-white hover:scale-110 hover:text-black active:scale-95 transition-all">${text}</button>`;
	}
}

customElements.define("pause-gui", PauseGUI);
