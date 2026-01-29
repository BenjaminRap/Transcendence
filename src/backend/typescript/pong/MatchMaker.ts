import { Room } from "./Room";
import type { ServerType } from "../index";
import { SocketEventController, type DefaultSocket } from "../controllers/SocketEventController";
import type { MatchController } from "../controllers/MatchController";
import { Container } from "../container/Container";
import { error, success, type Result } from "@shared/utils";

const	rooms = new Set<Room>();

export class	MatchMaker
{
	private _waitingSockets : DefaultSocket[] = [];
	private _matchController = Container.getInstance().getService<MatchController>("MatchController")


	constructor(
		private readonly _io : ServerType
	) {
	}

	public	addUserToMatchMaking(socket : DefaultSocket) : Result<null>
	{
		const	currentState = SocketEventController.getUserState(socket.data);

		if (currentState!== "unactive")
			return error("The user is already in a game, tournament or matchmaking");
		console.log("user added to matchmaking !");
		SocketEventController.once(socket, "leave-matchmaking", () => { this.removeUserFromMatchMaking(socket) });
		this._waitingSockets.push(socket);
		socket.data.setInWaitingQueue();
		this.createParty();
		return success(null);
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
		const	leftSocket = this._waitingSockets.pop()!;
		const	rightSocket = this._waitingSockets.pop()!;
		const	room = new Room(this._io, endData => {
			rooms.delete(room)
			this._matchController.registerMatch({
				leftId: leftSocket.data.getUserId(),
				leftGuestName: leftSocket.data.getGuestName(),
				rightId: rightSocket.data.getUserId(),
				rightGuestName: rightSocket.data.getGuestName(),
				winnerIndicator: endData.winner,
				scoreLeft: endData.scoreLeft,
				scoreRight: endData.scoreRight,
				duration: endData.duration
			});
		}, leftSocket, rightSocket);

		rooms.add(room);
	}
}
