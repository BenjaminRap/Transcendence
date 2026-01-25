import { Room } from "./Room";
import type { ServerTournament } from "./ServerTournament";
import type { DefaultSocket } from "../controllers/SocketEventController";
import { defaultProfile } from "@shared/Profile";

let	guestProfileId = BigInt(0);

function	getGuestName() : string
{
	guestProfileId++;
	return `guest${guestProfileId}`;
}

export type	OnlineProfile = {
	userId: number,
	username: string,
	image: string
}

export type SocketState = "unactive" | "waiting" | "playing" | "tournament-waiting" | "tournament-playing";

export class	SocketData
{
	private _state : SocketState = "unactive";
	private _room : Room | null = null;
	private _tournament : ServerTournament | null = null;
	private _onlineProfile : OnlineProfile | null = null;
	private _connected : boolean = false;
	private _guestName : string = getGuestName(); 
	private _alias : string | null = null;

	public ready : boolean = false;

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

	public setAlias(alias : string | null)
	{
		this._alias = alias;
	}

	public leaveTournament() {
		if (this._room !== null)
		{
			this._room.onSocketQuit(this._socket);
			this._room = null;
		}
		this._tournament = null;
		this._state = "unactive";
		this._alias = null;
	}

	public disconnectOrLogout() {
		try {
			this._room?.onSocketQuit(this._socket);
			this._room = null;
			this._tournament?.onSocketQuit(this._socket);
			this._tournament = null;
			this._onlineProfile = null;
			this._state = "unactive";
		} catch (error) {
			console.error(error);
		}
	}

	public authenticate(userId : number, userName : string, image : string)
	{
		this.disconnectOrLogout();
		this._onlineProfile = {
			username: userName,
			image,
			userId
		};
	}

	public getGuestName()
	{
		return this._guestName;
	}

	public getUserId()
	{
		return this._onlineProfile?.userId;
	}

	public getProfile() {
		const	shownName =
			this._alias !== null ? this._alias :
			this._onlineProfile ? this._onlineProfile.username :
			this._guestName;
		const	image = this._onlineProfile?.image ?? defaultProfile.image
		return {
			shownName : shownName,
			guestName: this._guestName,
			image: image
		};
	}

	public getAlias()
	{
		return this._alias;
	}
}
