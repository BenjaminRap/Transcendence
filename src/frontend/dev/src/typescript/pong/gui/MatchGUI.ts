export class	MatchGUI extends HTMLElement
{
	private static readonly _matchUrl : string = "/images/fight.png";

	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add("flex", "flex-col");
		this.innerHTML = `
			<div class="block border-solid border-black border-[0.2vw] rounded-3xl aspect-2/3 w-[5vw] m-auto">
				<img src="${MatchGUI._matchUrl}" class="m-auto w-4/5 h-auto mt-[46%]" />
			</div>
			<div class="w-full h-[10vh]">
				<div class="w-[1vw] bg-black m-auto h-1/2"></div>
				<div class="w-full border-[1vw] border-b-0 border-black h-1/2 box-border rounded-t-md"></div>
			</div>
		`;
	}
}

customElements.define("match-gui", MatchGUI);
