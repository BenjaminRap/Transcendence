import { ServerSceneData } from "./ServerSceneData.js";
import { ServerPongGame } from "./ServerPongGame.js";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { zodKeysUpdate } from "../../../shared/ServerMessage.js";
import { ClientProxy } from "./ClientProxy.js";
import { Observable } from "@babylonjs/core";
export class Room {
    static { this._showParticipantsTimeoutMs = 2000; }
    constructor(_io, _onDispose, firstSocket, secondSocket) {
        this._io = _io;
        this._onDispose = _onDispose;
        this._sockets = [];
        this._disposed = false;
        this._socketsReadyCount = 0;
        this._timeout = null;
        this._observers = new Map();
        this._roomId = crypto.randomUUID();
        this._sockets.push(firstSocket, secondSocket);
        this.init();
    }
    async init() {
        const participants = this._sockets.map((socket) => socket.data.getProfile());
        for (let index = 0; index < this._sockets.length; index++) {
            const socket = this._sockets[index];
            await this.addSocketToRoom(socket, index, participants);
        }
        const clientProxy = new ClientProxy(this);
        this._sceneData = new ServerSceneData(new HavokPlugin(false), clientProxy);
        this._serverPongGame = new ServerPongGame(this._sceneData);
    }
    dispose(endData) {
        if (this._disposed)
            return;
        if (this._timeout)
            clearTimeout(this._timeout);
        console.log("disposing room !");
        this._io.to(this._roomId).emit("game-infos", { type: "room-closed" });
        this._disposed = true;
        this._sockets.forEach((socket) => { this.removeSocketFromRoom(socket); });
        this._serverPongGame?.dispose();
        this._serverPongGame = undefined;
        this._onDispose(endData);
    }
    onSocketDisconnect(socket) {
        if (this._disposed)
            return;
        socket.broadcast.to(this._roomId).emit("game-infos", { type: "forfeit" });
        const winningSide = (socket === this._sockets[0]) ? "left" : "right";
        this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
    }
    removeSocketFromRoom(socket) {
        socket.data.leaveRoom();
        socket.leave(this._roomId);
        socket.removeAllListeners("ready");
        socket.removeAllListeners("input-infos");
        socket.removeAllListeners("forfeit");
    }
    async addSocketToRoom(socket, playerIndex, participants) {
        socket.data.joinRoom(this);
        await socket.join(this._roomId);
        const gameInit = {
            playerIndex: playerIndex,
            participants: participants
        };
        socket.emit("joined-game", gameInit);
        socket.once("ready", () => { this.setSocketReady(); });
    }
    setSocketReady() {
        this._socketsReadyCount++;
        if (this._socketsReadyCount === 2)
            this.startGame();
    }
    async startGame() {
        await this._sceneData.readyPromise.promise;
        await this.delay(Room._showParticipantsTimeoutMs);
        this._sceneData.events.getObservable("game-start").notifyObservers();
        this._sceneData.events.getObservable("end").add(endData => { this.gameEnd(endData); });
        this.sendMessageToRoom("ready");
        this._sockets.forEach((socket, index) => {
            socket.once("forfeit", () => {
                socket.broadcast.to(this._roomId).emit("game-infos", { type: "forfeit" });
                const winningSide = (index === 0) ? "left" : "right";
                this._sceneData.events.getObservable("forfeit").notifyObservers(winningSide);
            });
        });
    }
    gameEnd(endData) {
        setTimeout(() => {
            this.dispose(endData);
        }, 0);
    }
    sendMessageToRoom(event, ...args) {
        this._io.to(this._roomId).emit(event, ...args);
    }
    sendMessageToSocketByIndex(socketIndex, event, ...args) {
        if (socketIndex < 0 || socketIndex >= this._sockets.length)
            return;
        const socket = this._sockets[socketIndex];
        socket.emit(event, ...args);
    }
    broadcastMessageFromSocket(socketIndex, event, ...args) {
        if (socketIndex < 0 || socketIndex >= this._sockets.length)
            return;
        const socket = this._sockets[socketIndex];
        socket.broadcast.to(this._roomId).emit(event, ...args);
    }
    onSocketMessage(event) {
        const observer = this._observers.get(event);
        if (observer !== undefined)
            return observer;
        const newObserver = this.createNewObservable(event);
        this._observers.set(event, newObserver);
        return newObserver;
    }
    createNewObservable(event) {
        const observable = new Observable();
        this._sockets.forEach((socket, index) => {
            socket.on(event, (data) => {
                const keysUpdate = zodKeysUpdate.safeParse(data);
                if (!keysUpdate.success)
                    return;
                const clientMessage = {
                    socketIndex: index,
                    data: keysUpdate.data
                };
                observable.notifyObservers(clientMessage);
            });
        });
        return observable;
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
}
