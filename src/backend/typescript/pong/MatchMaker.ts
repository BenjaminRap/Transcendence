import { Room } from "./Room";
import type { DefaultServer, DefaultSocket } from "../index";

const	rooms = new Set<Room>();

export class	MatchMaker
{
	private _waitingSockets : DefaultSocket[] = [];


	constructor(
		private readonly _io : DefaultServer
	) {
	}

	public	addUserToMatchMaking(socket : DefaultSocket)
	{
		if (socket.data.getState() !== "unactive")
			return ;
		console.log("user added to matchmaking !");
		socket.once("leave-matchmaking", () => { this.removeUserFromMatchMaking(socket) });
		this._waitingSockets.push(socket);
		socket.data.setInWaitingQueue();
		this.createParty();
	}

	public	removeUserFromMatchMaking(socket : DefaultSocket)
	{
		if (socket.data.getState() !== "waiting")
			return ;
		socket.data.setOutWaitingQueue();
		console.log("user removed from matchmaking !");
		const	index = this._waitingSockets.indexOf(socket);

		if (index < 0)
			return ;
		this._waitingSockets.splice(index, 1);
	}

	private createParty()
	{
		if (this._waitingSockets.length < 2)
			return ;
		console.log("creating party");
		const	firstSocket = this._waitingSockets.pop()!;
		const	secondSocket = this._waitingSockets.pop()!;
		const	room = new Room(this._io, () => rooms.delete(room), firstSocket, secondSocket);

		rooms.add(room);
	}
}
