import { defaultProfile, type Profile } from "@shared/Profile";
import type { DefaultSocket } from "../";
import { Room } from "./Room";
import type { ServerTournament } from "./ServerTournament";

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
	private _state : "unactive" | "waiting" | "playing" | "tournament-waiting" | "tournament-playing" = "unactive";
	private _room : Room | null = null;
	private _tournament : ServerTournament | null = null;
	private _profile : Profile = getGuestProfile();
	private _connected : boolean = false;

	public getState() {
		return this._state;
	}

	public isConnected() {
		return this._connected;
	}

	constructor(private readonly _socket : DefaultSocket, public userId : number)
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
		if (this._state === "tournament-waiting")
			this._state = "tournament-playing";
		else
			this._state = "playing";
	}

	public leaveRoom() {
		this._room = null;
		if (this._state === "tournament-playing")
			this._state = "tournament-waiting";
		else
			this._state = "unactive";
	}

	public joinTournament(tournament : ServerTournament) {
		this._tournament = tournament;
		this._state = "tournament-waiting";
	}

	public leaveTournament() {
		this._tournament = null;
		this._state = "unactive";
	}

	public disconnect() {
		this._room?.onSocketDisconnect(this._socket);
		this._tournament?.onSocketDisconnect(this._socket);
	}

	public getProfile() {
		return this._profile;
	}
}
