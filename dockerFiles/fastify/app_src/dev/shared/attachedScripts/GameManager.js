var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { Ball } from "../attachedScripts/Ball.js";
import { getSceneData, SceneData } from "../SceneData.js";
import { Vector3 } from "@babylonjs/core";
import { Imported } from "../ImportedDecorator.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
export class GameManager extends CustomScriptComponent {
    static { this._pointsToWin = 5; }
    constructor(transform, scene, properties = {}, alias = "GameManager") {
        super(transform, scene, properties, alias);
        this._scoreRight = 0;
        this._scoreLeft = 0;
        this._ended = false;
        this._isGamePaused = false;
        this._sceneData = getSceneData(this.scene);
        this._defaultTimeStep = this._sceneData.havokPlugin.getTimeStep();
        if (this._sceneData.gameType !== "Multiplayer")
            this._sceneData.havokPlugin.onTriggerCollisionObservable.add(this.onTriggerEvent.bind(this));
    }
    ready() {
        this._sceneData.events.getObservable("game-start").add(() => {
            this.reset();
            this.unPause();
        });
        this._sceneData.events.getObservable("forfeit").add((winner) => { this.endMatch(winner, true); });
        this._sceneData.readyPromise.resolve();
    }
    onTriggerEvent(eventData) {
        if (this._ended
            || eventData.type === PhysicsEventType.TRIGGER_ENTERED
            || eventData.collider.transformNode !== this._ball.transform
            || eventData.collider.getLinearVelocity().equals(Vector3.ZeroReadOnly))
            return;
        const collidedNode = eventData.collidedAgainst.transformNode;
        if (collidedNode === this._goalLeft)
            this.onGoal("right");
        else if (collidedNode === this._goalRight)
            this.onGoal("left");
    }
    onGoal(side) {
        if (side === "right") {
            this._scoreRight++;
            this._sceneData.events.getObservable("updateRightScore").notifyObservers(this._scoreRight);
            if (this._scoreRight === GameManager._pointsToWin)
                this.endMatch("right", false);
        }
        else {
            this._scoreLeft++;
            this._sceneData.events.getObservable("updateLeftScore").notifyObservers(this._scoreLeft);
            if (this._scoreLeft === GameManager._pointsToWin)
                this.endMatch("left", false);
        }
        if (!this._ended)
            this._ball.launch();
        else
            this._ball.reset();
    }
    endMatch(winner, forfeit) {
        if (this._ended)
            return;
        this._ended = true;
        const endData = {
            winner: (winner === "highestScore") ? this.getHighestScoreSide() : winner,
            forfeit: forfeit
        };
        this._sceneData.events.getObservable("end").notifyObservers(endData);
    }
    getHighestScoreSide() {
        if (this._scoreLeft > this._scoreRight)
            return "left";
        if (this._scoreRight > this._scoreLeft)
            return "right";
        return "draw";
    }
    reset() {
        this._ended = false;
        this._scoreLeft = 0;
        this._scoreRight = 0;
    }
    hasEnded() {
        return (this._ended);
    }
    pause() {
        if (this._isGamePaused || this._sceneData.gameType === "Multiplayer" || this._ended)
            return;
        this._isGamePaused = true;
        this._sceneData.havokPlugin.setTimeStep(0);
        this._sceneData.events.getObservable("game-paused").notifyObservers();
    }
    unPause() {
        if (!this._isGamePaused)
            return;
        this._isGamePaused = false;
        this._sceneData.havokPlugin.setTimeStep(this._defaultTimeStep);
        this._sceneData.events.getObservable("game-unpaused").notifyObservers();
    }
    destroy() {
        this.unPause();
    }
}
__decorate([
    Imported(TransformNode)
], GameManager.prototype, "_goalLeft", void 0);
__decorate([
    Imported(TransformNode)
], GameManager.prototype, "_goalRight", void 0);
__decorate([
    Imported("Ball")
], GameManager.prototype, "_ball", void 0);
SceneManager.RegisterClass("GameManager", GameManager);
