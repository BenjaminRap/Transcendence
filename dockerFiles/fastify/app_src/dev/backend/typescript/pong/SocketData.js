import { defaultProfile } from "../../../shared/Profile.js";
import { Room } from "./Room.js";
let guestProfileId = BigInt(0);
function getGuestProfile() {
    guestProfileId++;
    return {
        name: `guest${guestProfileId}`,
        image: defaultProfile.image
    };
}
export class SocketData {
    getState() {
        return this._state;
    }
    isConnected() {
        return this._connected;
    }
    constructor(_socket, userId) {
        this._socket = _socket;
        this.userId = userId;
        this._state = "unactive";
        this._room = null;
        this._tournament = null;
        this._profile = getGuestProfile();
        this._connected = false;
    }
    setInWaitingQueue() {
        this._state = "waiting";
    }
    setOutWaitingQueue() {
        this._state = "unactive";
    }
    joinRoom(room) {
        this._room = room;
        if (this._state === "tournament-waiting")
            this._state = "tournament-playing";
        else
            this._state = "playing";
    }
    leaveRoom() {
        this._room = null;
        if (this._state === "tournament-playing")
            this._state = "tournament-waiting";
        else
            this._state = "unactive";
    }
    joinTournament(tournament) {
        this._tournament = tournament;
        this._state = "tournament-waiting";
    }
    leaveTournament() {
        this._tournament = null;
        this._state = "unactive";
    }
    disconnect() {
        this._room?.onSocketDisconnect(this._socket);
        this._tournament?.onSocketDisconnect(this._socket);
    }
    getProfile() {
        return this._profile;
    }
}
