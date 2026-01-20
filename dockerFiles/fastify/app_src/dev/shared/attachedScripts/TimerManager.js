import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { GameManager } from "./GameManager.js";
import { Imported } from "../ImportedDecorator.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
import { getSceneData } from "../SceneData.js";
export class TimerManager extends CustomScriptComponent {
    constructor(transform, scene, properties = {}, alias = "TimerManager") {
        super(transform, scene, properties, alias);
        this._nextId = 0;
        this._paused = false;
        this._timers = new Map();
    }
    awake() {
        const sceneData = getSceneData(this.scene);
        sceneData.events.getObservable("game-paused").add(() => this._paused = true);
        sceneData.events.getObservable("game-unpaused").add(() => this._paused = false);
    }
    update() {
        if (this._paused)
            return;
        this._timers.forEach((timer, key) => {
            timer.remainingTime -= this.getDeltaMilliseconds();
            if (timer.remainingTime > 0)
                return;
            timer.callback();
            timer.remainingCall--;
            timer.remainingTime = timer.delayMs;
            if (timer.remainingCall <= 0)
                this._timers.delete(key);
        });
    }
    setTimer(callback, delayMs, remainingCall) {
        const timer = {
            callback: callback,
            delayMs: delayMs,
            remainingTime: delayMs,
            remainingCall: remainingCall
        };
        this._timers.set(this._nextId, timer);
        this._nextId++;
        return (this._nextId - 1);
    }
    setTimeout(callback, delayMs) {
        return this.setTimer(callback, delayMs, 1);
    }
    setInterval(callback, delayMs) {
        return this.setTimer(callback, delayMs, Infinity);
    }
    clearTimer(timer) {
        this._timers.delete(timer);
    }
}
SceneManager.RegisterClass("TimerManager", TimerManager);
