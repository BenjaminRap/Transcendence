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
	private _participantsCount : number = 0;

	protected _currentMatches : Match<T>[] = [];

	private	endTournament()
	{
		const	lastRound = this._tournamentMatches[this._tournamentMatches.length - 1];
		const	lastMatch = lastRound[0];

		this.onTournamentEnd(lastMatch.winner!.profile);
	}

	private async endRound()
	{
		if (this._round === "qualifications")
		{
			const	disqualified : ProfileWithScore<T>[] = [];
			TournamentHelper.setQualifiedParticipants(this._qualified, this._participants, disqualified, this._expectedQualifiedCount);
			disqualified.forEach(participant => this.onParticipantLose(participant.profile, true, this._participantsCount));
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
		if (this._timeout !== null)
			clearTimeout(this._timeout);
		this._timeout = setTimeout(() => {
			callback();
			this._timeout = null;
		}, durationMs);
	}

	protected	setParticipants(participants : T[])
	{
		this._participants = participants.map(profile => ({profile, score: 0}));
		this._participantsCount = this._participants.length;
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
		const	loser = match.loser;

		if (!loser)
			return ;
		if (this._round !== "qualifications")
			this.onParticipantLose(match.loser.profile, false, this._tournamentMatches[this._round].length);
		this._matchesFinished++;
		if (this._matchesFinished === this._currentMatches.length)
			this.endRound();
	}

	protected dispose()
	{
		if (this._timeout !== null)
			clearTimeout(this._timeout);
	}

	protected abstract	onParticipantLose(loser : T, isQualifications : boolean, roundMatchCount : number) : void;
	protected abstract	onQualificationsEnd(qualified : T[]) : void;
	protected abstract	onTournamentEnd(winner : T) : void;
	protected abstract	onTournamentShow() : void;
	protected abstract onNewMatches() : void;
	protected abstract	setRoundWinners(round : number, matches : Match<T>[]) : void;
}
