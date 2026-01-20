import { PongError } from "./pongError/PongError.js";
export class Match {
    constructor(_left, _right) {
        this._left = _left;
        this._right = _right;
    }
    setWinner(endData) {
        if (this._winner !== undefined)
            return;
        if (endData.winner === "draw")
            throw new PongError("A game can't be a draw in a tournament !", "quitPong");
        this._winnerSide = endData.winner;
        const winnerOrMatch = (endData.winner === "left") ? this._left : this._right;
        if (winnerOrMatch instanceof Match) {
            const winnerProfile = winnerOrMatch.winner;
            if (!winnerProfile)
                throw new PongError("setting the winner of a match while the child matches aren't finished !", "quitPong");
            this._winner = winnerProfile;
        }
        else
            this._winner = winnerOrMatch;
        this._winner.score += 1;
    }
    get winner() {
        return this._winner;
    }
    get winnerSide() {
        return this._winnerSide;
    }
    get right() {
        if (this._right instanceof Match)
            return this._right.winner;
        return this._right;
    }
    get left() {
        if (this._left instanceof Match)
            return this._left.winner;
        return this._left;
    }
    get loser() {
        const left = this.left;
        const right = this.right;
        if (this._winner === left)
            return right;
        if (this._winner === right)
            return left;
        return undefined;
    }
}
