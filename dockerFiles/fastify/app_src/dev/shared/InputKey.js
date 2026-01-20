import { PongError } from "./pongError/PongError.js";
export class InputKey {
    constructor() {
        this._isDown = false;
        this._keyObserver = [];
    }
    setKeyDown() {
        if (this._isDown)
            return;
        this._isDown = true;
        this._keyObserver.forEach((callback) => { callback("keyDown"); });
    }
    setKeyUp() {
        if (!this._isDown)
            return;
        this._isDown = false;
        this._keyObserver.forEach((callback) => { callback("keyUp"); });
    }
    isKeyDown() {
        return (this._isDown);
    }
    addKeyObserver(callback) {
        if (this._keyObserver.indexOf(callback) !== -1)
            throw new PongError("onKeyDownObserver already added to the list !", "quitPong");
        this._keyObserver.push(callback);
    }
    removeKeyObserver(callback) {
        const index = this._keyObserver.indexOf(callback);
        if (index === -1)
            return;
        this._keyObserver.splice(index, 1);
    }
}
