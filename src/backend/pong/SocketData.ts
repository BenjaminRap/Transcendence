import { Room } from "./Room";

export class	SocketData
{
	private _state : "unactive" | "waiting" | "inGame" = "unactive";
	private _room : Room | null = null;

	public getState = () => this._state;
	public isInRoom = (room : Room) => this._room == room;

	public setInWaitingQueue() {
		this._state = "waiting";
	}

	public joinGame(room : Room) {
		this._room = room;
		this._state = "inGame";
	}

	public leaveGame(newState : "unactive" | "waiting") {
		const	previousRoom = this._room;

		this._room = null;
		previousRoom?.dispose();
		this._state = newState;
	}
}
