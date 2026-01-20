import { TournamentHelper } from "./TournamentHelper.js";
import { isPowerOfTwo } from "./utils.js";
export class Tournament {
    constructor() {
        this._round = "qualification";
        this._tournamentMatches = [];
        this._qualified = [];
        this._timeout = null;
        this._expectedQualifiedCount = 0;
        this._participants = [];
        this._matchesFinished = 0;
        this._currentMatches = [];
    }
    static { this._showOpponentsDurationMs = 2000; }
    static { this._showTournamentDurationMs = 5000; }
    endTournament() {
        const lastRound = this._tournamentMatches[this._tournamentMatches.length - 1];
        const lastMatch = lastRound[0];
        this.onTournamentEnd(lastMatch.winner.profile);
    }
    async endRound() {
        if (this._round === "qualification") {
            const disqualified = [];
            TournamentHelper.setQualifiedParticipants(this._qualified, this._participants, disqualified, this._expectedQualifiedCount);
            disqualified.forEach(participant => this.onParticipantLose(participant.profile));
            if (this._qualified.length === this._expectedQualifiedCount) {
                this.onQualificationsEnd(this._qualified.map(value => value.profile));
                this.onTournamentShow();
                await this.delay(Tournament._showTournamentDurationMs);
                this._round = 0;
                this._tournamentMatches = TournamentHelper.createTournamentMatches(this._qualified);
                this.setCurrentMatches([...this._tournamentMatches[this._round]]);
            }
            else
                this.setCurrentMatches(TournamentHelper.createQualificationMatches(this._participants));
        }
        else {
            this.setRoundWinners(this._round, this._tournamentMatches[this._round]);
            this._round++;
            if (this._round >= this._tournamentMatches.length)
                this.endTournament();
            else {
                this.onTournamentShow();
                await this.delay(Tournament._showTournamentDurationMs);
                this.setCurrentMatches([...this._tournamentMatches[this._round]]);
            }
        }
    }
    setCurrentMatches(matches) {
        this._currentMatches = matches;
        this._matchesFinished = 0;
        this.onNewMatches();
    }
    async delay(durationMs) {
        return new Promise((resolve, reject) => {
            if (this._timeout !== null) {
                reject();
                return;
            }
            this._timeout = setTimeout(() => {
                this._timeout = null;
                resolve();
            }, durationMs);
        });
    }
    setParticipants(participants) {
        this._participants = participants.map(profile => ({ profile, score: 0 }));
        this._expectedQualifiedCount = TournamentHelper.getExpectedQualified(this._participants.length);
    }
    createMatches() {
        if (isPowerOfTwo(this._participants.length)) {
            this._qualified = this._participants;
            this._participants = [];
        }
        this.endRound();
    }
    onMatchEnd(match) {
        const loser = match.loser;
        if (!loser)
            return;
        if (this._round !== "qualification")
            this.onParticipantLose(match.loser.profile);
        this._matchesFinished++;
        if (this._matchesFinished === this._currentMatches.length)
            this.endRound();
    }
    dispose() {
        if (this._timeout !== null)
            clearTimeout(this._timeout);
    }
}
