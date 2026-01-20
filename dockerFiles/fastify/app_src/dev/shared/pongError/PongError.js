export class PongError extends Error {
    constructor(message, _severity) {
        super(message);
        this._severity = _severity;
        this.name = new.target.name;
    }
    getSeverity() {
        return this._severity;
    }
}
