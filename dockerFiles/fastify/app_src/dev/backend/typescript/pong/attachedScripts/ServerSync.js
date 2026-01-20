var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { ServerSceneData } from "../ServerSceneData.js";
import { InputManager, PlayerInput } from "../../../../shared/attachedScripts/InputManager.js";
import { InputKey } from "../../../../shared/InputKey.js";
import { Vector3 } from "@babylonjs/core";
import { getServerSceneData } from "../ServerPongGame.js";
import { TimerManager } from "../../../../shared/attachedScripts/TimerManager.js";
import { Paddle } from "../../../../shared/attachedScripts/Paddle.js";
import { Imported } from "../../../../shared/ImportedDecorator.js";
import { Ball } from "../../../../shared/attachedScripts/Ball.js";
import { CustomScriptComponent } from "../../../../shared/CustomScriptComponent.js";
export class ServerSync extends CustomScriptComponent {
    static { this._sendInfoDelay = 100; }
    constructor(transform, scene, properties = {}, alias = "ServerSync") {
        super(transform, scene, properties, alias);
        this._sceneData = getServerSceneData(this.scene);
    }
    start() {
        this._timerManager.setInterval(this.sendInfos.bind(this), ServerSync._sendInfoDelay);
        this.listenToClients();
        this._sceneData.events.getObservable("updateLeftScore").add(() => { this.notifyGoal("left"); });
        this._sceneData.events.getObservable("updateRightScore").add(() => { this.notifyGoal("right"); });
    }
    notifyGoal(side) {
        const message = {
            type: "goal",
            goal: {
                side: side,
                newBallDirection: this._ball.getBallStartDirection()
            }
        };
        this._sceneData.clientProxy.sendMessageToRoom("game-infos", message);
    }
    sendInfos() {
        const message = {
            type: "itemsUpdate",
            itemsUpdate: {
                paddleRightPos: this.getXYZ(this._paddleRight.transform.position),
                paddleLeftPos: this.getXYZ(this._paddleLeft.transform.position),
                ball: {
                    pos: this.getXYZ(this._ball.transform.position),
                    linearVelocity: this.getXYZ(this._ball.getLinearVelocity())
                }
            }
        };
        this._sceneData.clientProxy.sendMessageToRoom("game-infos", message);
    }
    getXYZ(v) {
        return { x: v.x, y: v.y, z: v.z };
    }
    listenToClients() {
        this._sceneData.clientProxy.onSocketMessage("input-infos").add((message) => {
            const inputs = this._inputManager.getPlayerInput(message.socketIndex);
            this.onKeyUpdate(message.data, inputs, message.socketIndex);
        });
    }
    onKeyUpdate(keysUpdate, playerInputs, socketIndex) {
        const gameInfos = {
            type: "input",
            keysUpdate: keysUpdate
        };
        this._sceneData.clientProxy.broadcastMessageFromSocket(socketIndex, "game-infos", gameInfos);
        this.updateKey(keysUpdate.up, playerInputs.up);
        this.updateKey(keysUpdate.down, playerInputs.down);
    }
    updateKey(keyUpdate, inputKey) {
        if (!keyUpdate)
            return;
        if (keyUpdate.event === "keyDown")
            inputKey.setKeyDown();
        else
            inputKey.setKeyUp();
    }
}
__decorate([
    Imported("Ball")
], ServerSync.prototype, "_ball", void 0);
__decorate([
    Imported("Paddle")
], ServerSync.prototype, "_paddleRight", void 0);
__decorate([
    Imported("Paddle")
], ServerSync.prototype, "_paddleLeft", void 0);
__decorate([
    Imported("InputManager")
], ServerSync.prototype, "_inputManager", void 0);
__decorate([
    Imported("TimerManager")
], ServerSync.prototype, "_timerManager", void 0);
SceneManager.RegisterClass("ServerSync", ServerSync);
