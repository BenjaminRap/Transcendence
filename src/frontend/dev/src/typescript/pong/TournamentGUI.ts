import type { Profile } from "./FrontendTournament";
import { applyTheme, type ThemeName } from "./menuStyles";

export class	TournamentGUI extends HTMLElement
{
	private	_profileWidth : string = "10vw";
	private _pathHeight : string = "10vw";
	private _participants : Profile[];

	constructor(style? : ThemeName, participants?: Profile[])
	{
		super();
		applyTheme(this, style ?? "basic");
		this._participants = participants ?? [];
	}

	connectedCallback()
	{
		this.classList.add("absolute", "inset-0", "size-full", "z-10", "cursor-default", "select-none", "pointer-events-none");
	}

	private	createContent(level : number)
	{

	}
}

customElements.define("tournament-gui", TournamentGUI);
