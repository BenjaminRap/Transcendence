import { Room } from "./Room";

export class	SocketData
{
	private _state : "unactive" | "waiting" | "inRoom" | "ready" = "unactive";
	private _room : Room | null = null;

	public getState = () => this._state;
	public isInRoom = (room : Room) => this._room == room;

	public setInWaitingQueue() {
		this._state = "waiting";
	}

	public joinRoom(room : Room) {
		this._room = room;
		this._state = "inRoom";
	}

	public	setReady()
	{
		if (this._state !== "inRoom")
			throw new Error("A socket has been set ready while not being in a room !");
		this._state = "ready";
	}

	public leaveGame() {
		// const	previousRoom = this._room;
		//
		// this._room = null;
		// previousRoom?.dispose();
		this._state = "unactive";
	}
}
