import { TournamentHelper, type ProfileWithScore } from "@shared/TournamentHelper";
import type { Match } from "@shared/Match";
import { isPowerOfTwo } from "@shared/utils";

export abstract class	Tournament<T>
{
	protected static readonly _showOpponentsDurationMs = 2000;
	private static readonly _showTournamentDurationMs = 5000;

	private _round :  "qualifications" | number = "qualifications";
	private _tournamentMatches : Match<T>[][] = [];
	private _qualified : ProfileWithScore<T>[] = [];
	private _timeout : ReturnType<typeof setTimeout> | null = null;
	private _expectedQualifiedCount : number = 0;
	private _participants : ProfileWithScore<T>[] = [];
	private _matchesFinished : number = 0;

	protected _currentMatches : Match<T>[] = [];

	private	endTournament()
	{
		const	lastMatch = this._tournamentMatches[this._tournamentMatches.length - 1][0];
		const	winner = lastMatch.winner;

		this.onTournamentEnd(winner?.profile);
	}

	private async endRound()
	{
		if (this._round === "qualifications")
		{
			const	disqualified : ProfileWithScore<T>[] = [];
			TournamentHelper.setQualifiedParticipants(this._qualified, this._participants, disqualified, this._expectedQualifiedCount);
			const	rank = this._qualified.length + this._participants.length + 1;
			disqualified.forEach(participant => this.onParticipantLose(participant.profile, true, rank));
			if (this._qualified.length === this._expectedQualifiedCount)
			{
				this.onQualificationsEnd(this._qualified.map(value => value.profile));
				this.onTournamentShow();
				this.delay(() => {
					this._round = 0;
					this._tournamentMatches = TournamentHelper.createTournamentMatches(this._qualified);
					this.setCurrentMatches(this._tournamentMatches[this._round]);
				}, Tournament._showTournamentDurationMs);
			}
			else
				this.setCurrentMatches(TournamentHelper.createQualificationMatches(this._participants));
		}
		else
		{
			this.setRoundWinners(this._round, this._tournamentMatches[this._round]);
			this._round++;
			if (this._round >= this._tournamentMatches.length)
				this.endTournament();
			else
			{
				this.onTournamentShow();
				const	currentMatches = this._tournamentMatches[this._round];
				this.delay(() => this.setCurrentMatches(currentMatches), Tournament._showTournamentDurationMs);
			}
		}
	}

	private	setCurrentMatches(matches : Match<T>[])
	{
		this._currentMatches = matches;
		this._matchesFinished = 0;
		this.onNewMatches();
	}

	protected async delay(callback: () => void, durationMs : number)
	{
		this.clearDelay();
		this._timeout = setTimeout(() => {
			callback();
			this._timeout = null;
		}, durationMs);
	}

	protected	clearDelay()
	{
		if (!this._timeout)
			return ;
		clearTimeout(this._timeout);
		this._timeout = null;
	}

	protected	setParticipants(participants : T[])
	{
		this._participants = participants.map(profile => ({profile, score: 0}));
		this._expectedQualifiedCount = TournamentHelper.getExpectedQualified(this._participants.length);
	}

	protected createMatches()
	{
		if (isPowerOfTwo(this._participants.length))
		{
			this._qualified = this._participants;
			this._participants = [];
		}
		this.endRound();
	}

	protected	onMatchEnd(match : Match<T>)
	{
		const	losers = match.losers;
		const	round = this._round;

		if (round !== "qualifications")
		{
			losers.forEach(loser => this.onParticipantLose(loser.profile, false, this._tournamentMatches[round].length * 2));
		}
		this._matchesFinished++;
		if (this._matchesFinished === this._currentMatches.length)
			this.endRound();
	}

	protected dispose()
	{
		this.clearDelay();
	}

	protected abstract	onParticipantLose(loser : T, isQualifications : boolean, roundParticipantsCount : number) : void;
	protected abstract	onQualificationsEnd(qualified : T[]) : void;
	protected abstract	onTournamentEnd(winner? : T) : void;
	protected abstract	onTournamentShow() : void;
	protected abstract onNewMatches() : void;
	protected abstract	setRoundWinners(round : number, matches : Match<T>[]) : void;
}
