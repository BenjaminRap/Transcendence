import type { Match } from "@shared/Match";
import type { EndData } from "@shared/attachedScripts/GameManager";
import type { FrontendEventsManager } from "./FrontendEventsManager";
import { PongError } from "@shared/pongError/PongError";
import { Tournament } from "@shared/Tournament";
import type { Profile } from "@shared/ServerMessage";

export class	LocalTournament extends Tournament<Profile>
{
	private _currentMatchIndex = 0;
	private _events? : FrontendEventsManager;

	constructor(participants : Profile[])
	{
		super();
		this.setParticipants(participants);
	}

	private	async startCurrentGame()
	{
		if (this._currentMatchIndex >= this._currentMatches.length)
			return ;
		const	match = this._currentMatches[this._currentMatchIndex];
		const	left = match.left;
		const	right = match.right;

		if (left === undefined || right === undefined)
			throw new PongError("A match is started, but the players has'nt finished their match !", "quitPong");
		this._events?.getObservable("set-participants").notifyObservers([left.profile, right.profile]);
		await this.delay(() => {
			this._events?.getObservable("game-start").notifyObservers();
		},Tournament._showOpponentsDurationMs);
	}

	public setEventsAndStart(events : FrontendEventsManager)
	{
		this._events = events;
		this.createMatches();
	}

	public	setMatchWinner(endData : EndData)
	{
		const	match = this._currentMatches[this._currentMatchIndex];

		match.setWinner(endData);
	}

	public async startNextGame()
	{
		if (this._currentMatchIndex >= this._currentMatches.length)
			return ;
		const	match = this._currentMatches[this._currentMatchIndex];

		this.onMatchEnd(match);
		this._currentMatchIndex++;
		this.startCurrentGame();
	}

	public dispose()
	{
		super.dispose();
	}

	protected override onParticipantLose(): void
	{
	}

	protected override onQualificationsEnd(qualified: Profile[]): void
	{
		this._events?.getObservable("tournament-event").notifyObservers({
			type: "tournament-gui-create",
			qualified: qualified
		});
	}

    protected override onTournamentEnd(winner: Profile): void
	{
		this._events?.getObservable("tournament-event").notifyObservers({
			type: "win",
			winner: winner
		});
    }

    protected override onTournamentShow(): void
	{
		this._events?.getObservable("tournament-event").notifyObservers({
			type: "show-tournament"
		});
    }

    protected override onNewMatches(): void
	{
		this._currentMatchIndex = 0;
		this.startCurrentGame();
    }

    protected override setRoundWinners(round: number, matches: Match<Profile>[]): void
	{
		this._events?.getObservable("tournament-event").notifyObservers({
			type: "tournament-gui-set-winners",
			round: round,
			matches: matches
		});
    }
}
