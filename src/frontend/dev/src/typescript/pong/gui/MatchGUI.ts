export class	MatchGUI extends HTMLElement
{
	private static readonly _fightMask : string = "url(/images/fight.png)";

	constructor()
	{
		super();
		this.style.setProperty("--fight-mask", MatchGUI._fightMask);
	}

	connectedCallback()
	{
		this.classList.add("flex", "flex-col");
		this.innerHTML = `
			<div class="block border-solid border-(--border-color) border-[0.2cqw] rounded-3xl aspect-2/3 w-1/2 m-auto bg-(--background-color) bg-(image:--background-image)">
				<div class="m-auto w-4/5 aspect-square mt-[46%] mask-(--fight-mask) mask-no-repeat mask-contain mask-center bg-(--border-color)"></div>
			</div>
			<div class="w-full h-[10cqw]">
				<div class="w-(--match-line-width) bg-(--border-color) m-auto h-1/2"></div>
				<div class="w-full border-(length:--match-line-width) border-b-0 border-(--border-color) h-1/2 box-border rounded-t-md"></div>
			</div>
		`;
	}
}

customElements.define("match-gui", MatchGUI);
