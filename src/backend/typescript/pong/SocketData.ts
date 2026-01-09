import { defaultProfile, type Profile } from "@shared/Profile";
import type { DefaultSocket } from "../";
import { Room } from "./Room";
import { PongError } from "@shared/pongError/PongError";

export class	SocketData
{
	private _state : "unactive" | "waiting" | "inRoom" | "ready" = "unactive";
	private _room : Room | null = null;
	private _profile : Profile = defaultProfile;

	public getState = () => this._state;
	public isInRoom = (room : Room) => this._room == room;

	constructor(private readonly _socket : DefaultSocket)
	{
	}

	public setInWaitingQueue() {
		this._state = "waiting";
	}

	public setOutWaitingQueue() {
		this._state = "unactive";
	}

	public joinRoom(room : Room) {
		this._room = room;
		this._state = "inRoom";
	}

	public	setReady()
	{
		if (this._state !== "inRoom")
			return ;
		this._state = "ready";
	}

	public leaveRoom() {
		this._room = null;
		this._state = "unactive";
	}

	public disconnect() {
		this._room?.onSocketDisconnect(this._socket);
	}

	public getProfile() {
		return this._profile;
	}
}
