import { defaultProfile, type Profile } from "@shared/Profile";
import type { DefaultSocket } from "../";
import { Room } from "./Room";

let	guestProfileId = BigInt(0);

function	getGuestProfile() : Profile
{
	guestProfileId++;
	return {
		name: `guest${guestProfileId}`,
		image: defaultProfile.image
	}
}

export class	SocketData
{
	private _state : "unactive" | "waiting" | "inRoom" = "unactive";
	private _room : Room | null = null;
	private _profile : Profile = getGuestProfile();
	private _connected : boolean = false;

	public getState() {
		return this._state;
	}

	public isConnected() {
		return this._connected;
	}

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
