import { Observable } from "@babylonjs/core/Misc/observable";
import { Room } from "./Room.js";
export class ClientProxy {
    constructor(_room) {
        this._room = _room;
    }
    sendMessageToSocket(socketIndex, event, ...args) {
        this._room.sendMessageToSocketByIndex(socketIndex, event, ...args);
    }
    broadcastMessageFromSocket(socketIndex, event, ...args) {
        this._room.broadcastMessageFromSocket(socketIndex, event, ...args);
    }
    sendMessageToRoom(event, ...args) {
        this._room.sendMessageToRoom(event, ...args);
    }
    onSocketMessage(event) {
        return this._room.onSocketMessage(event);
    }
}
