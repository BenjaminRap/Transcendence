export class	MenuGUI extends HTMLElement
{
	constructor()
	{
		super();
	}

	public connectedCallback()
	{
		this.outerHTML = `
			<menu-gui class="absolute inset-0 size-full z-10">
				<div class="bottom-0 left-1/2 absolute -translate-1/2">
					<button></button>
					<p>Nature</p>
					<button></button>
				</div>
			</menu-gui>`;
	}

	public disconnectedCallback()
	{

	}
}

customElements.define("menu-gui", MenuGUI);
