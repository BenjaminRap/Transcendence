import type { Profile } from "@shared/Profile";

export class	TournamentWinnerGUI extends HTMLElement
{
	constructor()
	{
		super();
	}

	connectedCallback()
	{
		this.classList.add();
		this.innerHTML = `

		`;
	}

	public setWinner(winner : Profile)
	{

	}
}

customElements.define("tournament-winner-gui", TournamentWinnerGUI);
