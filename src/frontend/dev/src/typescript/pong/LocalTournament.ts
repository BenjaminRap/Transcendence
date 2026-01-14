import { TournamentHelper, type ProfileWithScore} from "@shared/TournamentHelper";
import type { Profile } from "@shared/Profile";
import type { Match } from "@shared/Match";
import { TournamentGUI } from "./gui/TournamentGUI";
import type { EndData } from "@shared/attachedScripts/GameManager";
import type { FrontendEventsManager } from "./FrontendEventsManager";
import { isPowerOfTwo } from "@shared/utils";
import { PongError } from "@shared/pongError/PongError";

export class	LocalTournament
{
	private static readonly _showTournamentDurationMs = 5000;
	private static readonly _showOpponentsDurationMs = 2000;

	private _round : "qualification" | number = "qualification";
	private _tournamentMatches : Match[][] = [];
	private _qualificationMatches : Match[] = [];
	private _currentMatchIndex = 0;
	private _qualified : ProfileWithScore[] = [];
	private _timeout : number | null = null;
	private _tournamentGUI? : TournamentGUI;
	private _expectedQualifiedCount : number;
	private _events! : FrontendEventsManager;
	private _participants : ProfileWithScore[]

	constructor(_participants : Profile[])
	{
		if (_participants.length > TournamentHelper.maxTournamentParticipants)
			throw new PongError(`Too many participants ! : max : ${TournamentHelper.maxTournamentParticipants}`, "quitPong");
		this._participants = _participants.map(profile => ({...profile, score: 0}));
		this._expectedQualifiedCount = TournamentHelper.getExpectedQualified(this._participants.length);
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
			throw new PongError("Error the tournament matches are empty !", "quitPong");
		const	lastRound = this._tournamentMatches[this._tournamentMatches.length - 1];
		if (lastRound.length !== 1)
			throw new PongError("Error, the last round should only be composed of one match !", "quitPong");
		const	lastMatch = lastRound[0];
		const	winner = lastMatch.getWinner();

		if (winner === undefined)
			throw new PongError("endTournament called but the tournament isn't finished !", "quitPong");
		this._events.getObservable("tournament-end").notifyObservers(winner);
	}

	private async endRound()
	{
		this._currentMatchIndex = 0;
		if (this._round === "qualification")
		{
			TournamentHelper.setQualifiedParticipants(this._qualified, this._participants, this._expectedQualifiedCount);
			if (this._qualified.length === this._expectedQualifiedCount)
			{
				this._round = 0;
				this._tournamentMatches = TournamentHelper.createTournamentMatches(this._qualified);
				this._tournamentGUI = new TournamentGUI(this._tournamentMatches, this._qualified);
				this._events.getObservable("show-tournament").notifyObservers(this._tournamentGUI);
				await this.delay(LocalTournament._showTournamentDurationMs);
				this.startCurrentMatch();
			}
			else
			{
				this._qualificationMatches = TournamentHelper.createQualificationMatches(this._participants);
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
			throw new PongError("The current timeout hasn't finished !", "quitPong");
		const	matches = this.getMatchList();

		if (matches === null)
			throw new PongError("Current match list is null in LocalTournament !", "quitPong");
		if (this._currentMatchIndex >= matches.length)
			throw new PongError("The current match index is out of bound !", "quitPong");
		const	match = matches[this._currentMatchIndex];
		const	left = match.getLeft();
		const	right = match.getRight();

		if (left === undefined || right === undefined)
			throw new PongError("A match is started, but the players has'nt finished their match !", "quitPong");
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

	public start(events : FrontendEventsManager)
	{
		this._events = events;
		if (isPowerOfTwo(this._participants.length))
		{
			this._qualified = this._participants;
			this._participants = [];
		}
		this.endRound();
	}

	public	onGameEnd(endData : EndData)
	{
		const	matches = this.getMatchList();
		if (matches === null)
			throw new PongError("Current match list is null in LocalTournament !", "quitPong");
		const	match = matches[this._currentMatchIndex];

		match.setWinner(endData);
	}

	public startNextGame()
	{
		this._currentMatchIndex++;

		const	matches = this.getMatchList();
		if (matches === null)
			throw new PongError("Current match list is null in LocalTournament !", "quitPong");
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
