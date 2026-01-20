import { HavokPlugin } from "@babylonjs/core";
import { SceneData } from "../../../shared/SceneData.js";
import { ClientProxy } from "./ClientProxy.js";
import { ServerEventsManager } from "./ServerEventsManager.js";
export class ServerSceneData extends SceneData {
    constructor(havokPlugin, clientProxy) {
        super(havokPlugin, "Server", new ServerEventsManager());
        this.clientProxy = clientProxy;
    }
    get events() {
        return this._events;
    }
    dispose() {
        this._events.dispose();
    }
}
