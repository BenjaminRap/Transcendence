import { Deferred, HavokPlugin, Scene } from "@babylonjs/core";
import { EventsManager } from "./EventsManager.js";
import { PongError } from "./pongError/PongError.js";
export class SceneData {
    constructor(havokPlugin, gameType, _events) {
        this.havokPlugin = havokPlugin;
        this.gameType = gameType;
        this._events = _events;
        this.readyPromise = new Deferred;
    }
    get events() {
        return this._events;
    }
}
export function getSceneData(scene) {
    if (!scene.metadata)
        throw new PongError("Scene metadata is undefined !", "quitPong");
    const sceneData = scene.metadata.sceneData;
    if (!(sceneData instanceof SceneData))
        throw new PongError("Scene is not of the type SceneData !", "quitPong");
    return sceneData;
}
