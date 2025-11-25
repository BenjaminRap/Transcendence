import { DefaultEventsMap, Server } from "socket.io";
import { Room } from "./Room";
import { DefaultSocket } from ".";

export class	MatchMaker
{
	private _waitingSockets : DefaultSocket[] = [];


	constructor(
		private readonly _io : Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
	) {
	}

	public	addUserToMatchMaking(socket : DefaultSocket)
	{
		if (socket.data.getState() !== "unactive")
			return ;
		console.log("user added to matchmaking !");
		socket.once("leave-matchmaking", () => { this.removeUserToMatchMaking(socket) });
		this._waitingSockets.push(socket);
		socket.data.setInWaitingQueue();
		this.createParty();
	}

	public	removeUserToMatchMaking(socket : DefaultSocket)
	{
		if (socket.data.getState() === "unactive")
			return ;
		console.log("removing user from matchmaking !");
		socket.data.leaveGame();
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
		new Room(this._io, firstSocket, secondSocket); // referenced in the sockets data so it isn't garbaged collected
	}
}
