import { Tournament} from "@shared/Tournament";
import type { Profile } from "@shared/Profile";
import type { Match } from "@shared/Match";
import { TournamentGUI } from "./gui/TournamentGUI";
import type { EndData } from "@shared/attachedScripts/GameManager";
import type { FrontendEventsManager } from "./FrontendEventsManager";
import { isPowerOfTwo } from "@shared/utils";

export class	LocalTournament extends Tournament
{
	private static readonly _showTournamentDurationMs = 5000;
	private static readonly _showOpponentsDurationMs = 2000;

	private _round : "qualification" | number = "qualification";
	private _tournamentMatches : Match[][] = [];
	private _qualificationMatches : Match[] = [];
	private _currentMatchIndex = 0;
	private _qualified : Profile[] = [];
	private _timeout : number | null = null;
	private _tournamentGUI? : TournamentGUI;
	private _expectedQualifiedCount : number;
	private _events! : FrontendEventsManager;

	constructor(private _participants : Profile[])
	{
		if (_participants.length > Tournament.maxTournamentParticipants)
			throw new Error(`Too many participants ! : max : ${Tournament.maxTournamentParticipants}`);
		super();
		this._expectedQualifiedCount = Tournament.getExpectedQualified(this._participants.length);
	}

	private	getMatchList()
	{
		if (this._round === "qualification")
			return this._qualificationMatches;
		else if (this._round >= this._tournamentMatches.length)
			return null;
		else
			return this._tournamentMatches[this._round];
	}

	private	endTournament()
	{
		if (this._tournamentMatches.length === 0)
			throw new Error("Error the tournament matches are empty !");
		const	lastRound = this._tournamentMatches[this._tournamentMatches.length - 1];
		if (lastRound.length !== 1)
			throw new Error("Error, the last round should only be composed of one match !");
		const	lastMatch = lastRound[0];
		const	winner = lastMatch.getWinner();

		if (winner === undefined)
			throw new Error("endTournament called but the tournament isn't finished !");
		this._events.getObservable("tournament-end").notifyObservers(winner);
	}

	private async endRound()
	{
		this._currentMatchIndex = 0;
		if (this._round === "qualification")
		{
			Tournament.setQualifiedParticipants(this._qualified, this._participants, this._expectedQualifiedCount);
			if (this._qualified.length === this._expectedQualifiedCount)
			{
				this._round = 0;
				this._tournamentMatches = Tournament.createTournamentMatches(this._qualified);
				this._tournamentGUI = new TournamentGUI(this._tournamentMatches, this._qualified);
				this._events.getObservable("show-tournament").notifyObservers(this._tournamentGUI);
				await this.delay(LocalTournament._showTournamentDurationMs);
				this.startCurrentMatch();
			}
			else
			{
				this._qualificationMatches = Tournament.createQualificationMatches(this._participants);
				this.startCurrentMatch();
			}
		}
		else
		{
			this._tournamentGUI?.setWinners(this._round);
			this._round++;
			if (this._round >= this._tournamentMatches.length)
				this.endTournament();
			else
			{
				this._events.getObservable("show-tournament").notifyObservers(this._tournamentGUI!);
				await this.delay(LocalTournament._showTournamentDurationMs);
				this.startCurrentMatch();
			}
		}
	}

	private	async startCurrentMatch()
	{
		if (this._timeout !== null)
			throw new Error("The current timeout hasn't finished !");
		const	matches = this.getMatchList();

		if (matches === null)
			throw new Error("Current match list is null in LocalTournament !");
		if (this._currentMatchIndex >= matches.length)
			throw new Error("The current match index is out of bound !");
		const	match = matches[this._currentMatchIndex];
		const	left = match.getLeft();
		const	right = match.getRight();

		if (left === undefined || right === undefined)
			throw new Error("A match is started, but the players has'nt finished their match !");
		this._events.getObservable("set-participants").notifyObservers([left, right]);
		await this.delay(LocalTournament._showOpponentsDurationMs);
		this._events.getObservable("game-start").notifyObservers();
	}

	private async delay(durationMs : number)
	{
		return new Promise<void>((resolve, reject) => {
			if (this._timeout !== null)
			{
				reject();
				return ;
			}
			this._timeout = window.setTimeout(() => {
				this._timeout = null;
				resolve();
			}, durationMs);
		})
	}

	public init(events : FrontendEventsManager)
	{
		this._events = events;
	}

	public start()
	{
		if (isPowerOfTwo(this._participants.length))
		{
			this._qualified = this._participants;
			this._participants = [];
		}
		this.endRound();
	}

	public	onGameEnd(endData : EndData)
	{
		if (endData.winner === "draw")
			throw new Error("A game can't be a draw in a tournament !");
		const	matches = this.getMatchList();
		if (matches === null)
			throw new Error("Current match list is null in LocalTournament !");
		const	match = matches[this._currentMatchIndex];

		match.setWinner(endData.winner);
		const	winner = match.getWinner()!;

		winner.score += 1;
	}

	public startNextGame()
	{
		this._currentMatchIndex++;

		const	matches = this.getMatchList();
		if (matches === null)
			throw new Error("Current match list is null in LocalTournament !");
		if (this._currentMatchIndex >= matches.length)
			this.endRound();
		else
			this.startCurrentMatch();
	}

	public dispose()
	{
		if (this._timeout !== null)
			clearTimeout(this._timeout);
	}
}
