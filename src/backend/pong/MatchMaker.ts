import { DefaultSocket } from "./index";
import { Room } from "./Room";

export class	MatchMaker
{
	private _waitingSockets : DefaultSocket[] = [];

	public	addUserToMatchMaking(socket : DefaultSocket)
	{
		if (socket.data.getState() !== "unactive")
			return ;
		this._waitingSockets.push(socket);
		socket.data.setInWaitingQueue();
		console.log("user added to matchmaking !");
		this.createParty();
	}

	public	removeUserToMatchMaking(socket : DefaultSocket)
	{
		console.log("removing user from matchmaking !");
		if (socket.data.getState() === "unactive")
			return ;
		socket.data.leaveGame("unactive");
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
		new Room(firstSocket, secondSocket); // referenced in the sockets data so it isn't garbaged collected
	}
}
