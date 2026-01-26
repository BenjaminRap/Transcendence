export class	DrawGUI extends HTMLElement
{
	private static readonly _drawImage = "url(/images/draw.png)";
	constructor()
	{
		super();
		this.style.setProperty("--draw-image", DrawGUI._drawImage);
		this.classList.add("block", "border-solid", "rounded-(--rounded)", "aspect-2/3", "border-(--border-color)", "border-(length:--border-width)", "bg-(image:--background-image)", "bg-(--background-color)");
		this.innerHTML = `
			<div class="m-auto mt-[5%] w-4/5 aspect-square pointer-events-none mask-no-repeat mask-contain mask-center mask-(--draw-image)"></div>
			<p class="mt-[10%] font-(family-name:--font) text-center text-(length:--opponent-font-size) text-(--text-color) text-wrap overflow-hidden">Draw</p>
		`;
	}
}

customElements.define("draw-gui", DrawGUI);
