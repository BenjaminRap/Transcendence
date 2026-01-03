export type OnlineTournamentJoinPublicGUIInputs =
{
}

export class	OnlineTournamentJoinPublicGUI extends HTMLElement
{
	private _buttons : OnlineTournamentJoinPublicGUIInputs | undefined;

	constructor()
	{
		super();
	}

	public	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "cursor-default", "select-none", "pointer-events-none");
		this.innerHTML = `
		`;
		this._buttons = {
		}
	}

	private	getButtonHTML(text : string, className : string)
	{
		return `<button class="${className} font-(family-name:--font) text-[3cqw] w-full mt-[10%] pointer-events-auto grow menu-button">${text}</button>`;
	}

	public getButtons() : OnlineTournamentJoinPublicGUIInputs | undefined
	{
		return this._buttons;
	}
}

customElements.define("online-tournament-join-public-gui", OnlineTournamentJoinPublicGUI);
