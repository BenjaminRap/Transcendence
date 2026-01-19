import { TournamentHelper, type ProfileWithScore } from "@shared/TournamentHelper";
import type { Match } from "@shared/Match";
import { isPowerOfTwo } from "@shared/utils";

export abstract class	Tournament<T>
{
	protected static readonly _showOpponentsDurationMs = 2000;
	private static readonly _showTournamentDurationMs = 5000;

	private _round : "qualification" | number = "qualification";
	private _tournamentMatches : Match<T>[][] = [];
	private _qualified : ProfileWithScore<T>[] = [];
	private _timeout : ReturnType<typeof setTimeout> | null = null;
	private _expectedQualifiedCount : number;
	private _participants : ProfileWithScore<T>[];
	private _matchesFinished : number = 0;

	protected _currentMatches : Match<T>[] = [];

	constructor(participants : T[])
	{
		this._participants = participants.map(profile => ({...profile, score: 0}));
		this._expectedQualifiedCount = TournamentHelper.getExpectedQualified(this._participants.length);
	}

	private	endTournament()
	{
		const	lastRound = this._tournamentMatches[this._tournamentMatches.length - 1];
		const	lastMatch = lastRound[0];

		this.onTournamentEnd(lastMatch.winner!);
	}

	private async endRound()
	{
		if (this._round === "qualification")
		{
			TournamentHelper.setQualifiedParticipants(this._qualified, this._participants, this._expectedQualifiedCount);
			if (this._qualified.length === this._expectedQualifiedCount)
			{
				this.onQualificationsEnd(this._qualified);
				this.onTournamentShow();
				await this.delay(Tournament._showTournamentDurationMs);
				this._round = 0;
				this._tournamentMatches = TournamentHelper.createTournamentMatches(this._qualified);
				this.setCurrentMatches([...this._tournamentMatches[this._round]]);
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
				await this.delay(Tournament._showTournamentDurationMs);
				this.setCurrentMatches([...this._tournamentMatches[this._round]])
			}
		}
	}

	private	setCurrentMatches(matches : Match<T>[])
	{
		this._currentMatches = matches;
		this._matchesFinished = 0;
		this.onNewMatches();
	}

	protected async delay(durationMs : number)
	{
		return new Promise<void>((resolve, reject) => {
			if (this._timeout !== null)
			{
				reject();
				return ;
			}
			this._timeout = setTimeout(() => {
				this._timeout = null;
				resolve();
			}, durationMs);
		});
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

	protected	onMatchEnd()
	{
		this._matchesFinished++;
		if (this._matchesFinished === this._currentMatches.length)
			this.endRound();
	}

	protected dispose()
	{
		if (this._timeout !== null)
			clearTimeout(this._timeout);
	}

	public abstract	onQualificationsEnd(qualified : T[]) : void;
	public abstract	onTournamentEnd(winner : T) : void;
	public abstract	onTournamentShow() : void;
	public abstract onNewMatches() : void;
	public abstract	setRoundWinners(round : number, matches : Match<T>[]) : void;
}
